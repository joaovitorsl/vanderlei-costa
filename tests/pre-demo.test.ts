import {test} from 'node:test';
import assert from 'node:assert/strict';
import {students,emptyStudent,saveStudent,nextEnrollment,normalizeStudent,goalLabel,type Student} from '../src/data.ts';
import {normalizeRaces,normalizeAgenda,initialAgenda,participantDistance,type Race,type AgendaEntry} from '../src/collectiveData.ts';
import {demoKeys,loadDemo} from '../src/demoStorage.ts';

test('enrollment is assigned at save, preserves existing IDs and skips used sequences',()=>{
  const draft=emptyStudent();assert.equal(draft.enrollment,'');assert.equal(nextEnrollment(students),'2026-013');
  const people=saveStudent(students,{...draft,enrollment:'2026-001'});
  assert.equal(people.at(-1)?.enrollment,'2026-013');assert.equal(students.length,12);
  const updated=saveStudent(people,{...people[0],enrollment:'manually changed',name:'Edited'});
  assert.equal(updated[0].enrollment,'2026-001');
  const withGap=[students[0],{...students[1],enrollment:'2026-020'}];
  assert.equal(nextEnrollment(withGap),'2026-021');
  const again=saveStudent(people,emptyStudent());
  assert.equal(again.at(-1)?.enrollment,'2026-014');
});
test('running start year is stable and legacy durations use the fixed demo date once',()=>{
  for(const [experience,year] of [['2 anos','2024'],['4 anos','2022'],['6 meses','2026'],['18 meses','2025']]){
    const {runningSince,...legacy}=students[0];
    const next=normalizeStudent({...legacy,experience} as unknown as Student);
    assert.equal(next.runningSince,year);assert.ok(!('experience' in next));
    assert.deepEqual(normalizeStudent(next),next);
  }
  assert.equal(normalizeStudent({...students[0],runningSince:'2022'}).runningSince,'2022');
});
test('legacy custom goals become Other without losing their text',()=>{
  const {customGoal,...legacy}=students[0];
  const next=normalizeStudent({...legacy,goal:'Correr sem parar'} as Student);
  assert.equal(next.goal,'Outro');assert.equal(goalLabel(next),'Correr sem parar');
  assert.deepEqual(normalizeStudent(next),next);
});
test('legacy races merge distances for one event and preserve athlete distances',()=>{
  const legacy=[{id:'r1',name:'Prova',date:'2026-11-01',distance:'5 km',location:'Parque',participantIds:['1']},{id:'r2',name:'Prova',date:'2026-11-01',distance:'10 km',location:'Parque',participantIds:['2']}];
  const next=normalizeRaces(legacy as unknown as Race[]);
  assert.equal(next.length,1);assert.deepEqual(next[0].distances,['5 km','10 km']);
  assert.equal(participantDistance(next[0],'1'),'5 km');assert.equal(participantDistance(next[0],'2'),'10 km');
  assert.deepEqual(normalizeRaces(next),next);assert.ok(!('participantIds' in next[0]));assert.ok(!('distance' in next[0]));
});
test('agenda migrates free Sundays and long runs without changing personalized titles',()=>{
  const legacy=[{id:'free',date:'2026-10-18',kind:'free-sunday'},{id:'run',date:'2026-10-11',kind:'meeting',time:'06:00',location:'Parque',title:'Longão coletivo',notes:'Referência'}];
  const next=normalizeAgenda(legacy as unknown as AgendaEntry[]);
  assert.equal(next[0].kind,'free-day');assert.equal(next[1].kind==='meeting'&&next[1].type,'long-run');
  assert.deepEqual(normalizeAgenda(next),next);assert.deepEqual(normalizeAgenda(initialAgenda),initialAgenda);
});
test('assessment records are isolated per student and survive reload/reset',()=>{
  const source=loadDemo({getItem:()=>null});
  assert.notEqual(source.assessments['1'],source.assessments['2']);
  const data={[demoKeys.students]:students,[demoKeys.assessments]:{...source.assessments,'1':[]}};
  const stored={getItem:(key:string)=>JSON.stringify(data[key as keyof typeof data]??null)};
  assert.equal(loadDemo(stored).assessments['1'].length,0);assert.equal(loadDemo(stored).assessments['2'].length,3);
  assert.equal(loadDemo(stored,true).assessments['1'].length,3);
});
