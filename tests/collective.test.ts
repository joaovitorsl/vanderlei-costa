import {test} from 'node:test';
import assert from 'node:assert/strict';
import {students, templates, initialSchedule, normalizeStudent} from '../src/data.ts';
import {initialRaces, initialAgenda, normalizeSchedule, migrateRaces, nextRaceFor, futureRaces, entriesForWeek, agendaConflict, entryWeek, type Race, type AgendaEntry} from '../src/collectiveData.ts';
import {demoKeys, loadDemo, resetDemo} from '../src/demoStorage.ts';
const oldRaces=[{name:'Circuito Parque Verde',date:'2026-10-25',distance:'10 km',participantIds:['1','3','5','7','9','11']},{name:'Meia da Primavera',date:'2026-11-08',distance:'21 km',participantIds:['2','4','6','8']}];
const legacy=students.map(p=>{const r=oldRaces.find(r=>r.participantIds.includes(p.id));return {...p,race:r?.name||'',raceDate:r?.date||'',raceDistance:r?.distance||''};});
const storage=(entries:Record<string,unknown>)=>({getItem:(key:string)=>key in entries?JSON.stringify(entries[key]):null});
test('race mocks keep all original participants, including Rafael at Primavera',()=>{
  const migrated=migrateRaces(legacy);
  assert.equal(migrated.length,2);
  for(const seed of oldRaces){const event=migrated.find(r=>r.name===seed.name)!;assert.deepEqual(event.participants.map(p=>p.studentId),seed.participantIds);assert.deepEqual(event.distances,[seed.distance]);assert.equal(event.date,seed.date);}
  assert.equal(nextRaceFor(migrated,'2')?.name,'Meia da Primavera');
  assert.equal(nextRaceFor(migrated,'10'),undefined);
});
test('profile always derives the nearest future linked event after edits, removals and deletion',()=>{
  const nearer:Race={id:'new',name:'Nova prova',date:'2026-10-10',distances:['5 km'],location:'',participants:[{studentId:'2',distance:'5 km'}]};
  const past={...nearer,id:'past',date:'2026-10-07'};
  assert.equal(nextRaceFor([...initialRaces,nearer,past],'2')?.id,'new');
  assert.equal(nextRaceFor([...initialRaces,{...nearer,date:'2026-12-01'}],'2')?.name,'Circuito Parque Verde');
  assert.equal(nextRaceFor([...initialRaces,{...nearer,participants:[]}],'2')?.name,'Circuito Parque Verde');
  assert.equal(nextRaceFor(initialRaces.filter(r=>r.id!=='race-parque'),'2')?.name,'Meia da Primavera');
  assert.ok(!futureRaces([past]).length);
});
test('migration reads events before stripping old student fields and preserves custom data',()=>{
  const prior=legacy.map(p=>({...p,notes:'Anotação personalizada'}));
  prior[0]={...prior[0],race:'Prova personalizada',raceDate:'2026-12-20',raceDistance:'3 km'};
  const loaded=loadDemo(storage({[demoKeys.students]:prior}));
  assert.equal(loaded.races.length,3);
  assert.equal(loaded.people[0].notes,'Anotação personalizada');
  assert.equal(loaded.races.find(r=>r.name==='Prova personalizada')?.participants[0].studentId,'1');
  for(const p of loaded.people){assert.ok(!('race' in p));assert.ok(!('raceDate' in p));assert.ok(!('raceDistance' in p));}
  assert.deepEqual(normalizeStudent(loaded.people[0]),loaded.people[0]);
  const reloaded=loadDemo(storage({[demoKeys.students]:loaded.people,[demoKeys.races]:loaded.races}));
  assert.deepEqual(reloaded.races,loaded.races);
});
test('empty/deleted events and agenda stay empty after reload; reset restores seed selectively',()=>{
  const loaded=loadDemo(storage({[demoKeys.students]:legacy,[demoKeys.races]:[],[demoKeys.agenda]:[]}));
  assert.deepEqual(loaded.races,[]);assert.deepEqual(loaded.agenda,[]);
  const reset=loadDemo(storage({[demoKeys.students]:legacy,[demoKeys.races]:[]}),true);
  assert.deepEqual(reset.races,initialRaces);assert.deepEqual(reset.agenda,initialAgenda);
  const removed:string[]=[];
  resetDemo(new URL('http://localhost/?resetDemo=1&foo=bar#test'),{removeItem:key=>removed.push(key)},url=>assert.equal(url,'/?foo=bar#test'));
  assert.deepEqual(removed,Object.values(demoKeys));
});
test('legacy locations are discarded without changing prescription or copy history',()=>{
  const workout={...templates[2],id:'custom',location:'Antigo local',notes:'Orientação individual',duplicatedFromWeek:-1};
  const input={'2:0:3':[workout]};const migrated=normalizeSchedule(input);
  assert.ok(!('location' in migrated['2:0:3'][0]));
  assert.equal(migrated['2:0:3'][0].notes,workout.notes);assert.equal(migrated['2:0:3'][0].duplicatedFromWeek,-1);
  assert.equal(input['2:0:3'][0].location,'Antigo local');assert.deepEqual(normalizeSchedule(migrated),migrated);
  assert.ok(templates.every(t=>!('location' in t)));assert.ok(Object.values(initialSchedule).flat().every(w=>!('location' in w)));
});
test('free Sunday is a manual collective record; only the exact old example is reverted',()=>{
  const seed=initialSchedule['1:1:6'][0];assert.equal(seed.title,'Rodagem longa');
  const legacy={...seed,title:'Treino livre',notes:'Faça no horário e local de sua preferência.',titleCustomized:true};
  assert.equal(normalizeSchedule({'1:1:6':[legacy]})['1:1:6'][0].title,'Rodagem longa');
  assert.equal(normalizeSchedule({'1:1:6':[{...legacy,notes:'Orientação editada'}]})['1:1:6'][0].title,'Treino livre');
  assert.deepEqual(entriesForWeek(initialAgenda,1),[{id:'free-sunday-example',kind:'free-day',date:'2026-10-18'}]);
  assert.deepEqual(entriesForWeek(initialAgenda,5),[]);
});
test('collective week is scoped, sorted by date/time and independent from prescriptions',()=>{
  const before=structuredClone(initialSchedule),events=entriesForWeek(initialAgenda,0);
  assert.equal(events.length,5);
  assert.deepEqual(events.map(e=>e.date),['2026-10-06','2026-10-06','2026-10-08','2026-10-08','2026-10-11']);
  assert.equal(entryWeek('2026-10-11'),0);assert.equal(entryWeek('2026-10-12'),1);assert.equal(entryWeek('2026-10-04'),-1);
  assert.equal(entriesForWeek([],0).length,0);assert.deepEqual(initialSchedule,before);
});
test('free day cannot coexist with a meeting and may occur on a weekday',()=>{
  const free:AgendaEntry={id:'test',kind:'free-day',date:'2026-10-11'};
  assert.match(agendaConflict(free,initialAgenda),/já tem/);
  assert.equal(agendaConflict({...free,date:'2026-10-08'},[]),'');
  assert.equal(agendaConflict({...free,date:'2026-10-25'},initialAgenda),'');
  assert.equal(agendaConflict(initialAgenda[5],initialAgenda),'');
  assert.match(agendaConflict({...initialAgenda[0],id:'new',date:'2026-10-18'},initialAgenda),/já tem/);
});
