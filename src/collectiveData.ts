import {normalize, today, weekDate, templates, type Student, type Schedule, type Workout} from './data.ts';

export type RaceParticipant = {studentId:string;distance:string};
export type Race = {id:string; name:string; date:string; distances:string[]; location:string; participants:RaceParticipant[]};
export type Meeting = {id:string; date:string; kind:'meeting'; type:'training'|'long-run'|'event'; time:string; location:string; title:string; notes:string};
export type FreeDay = {id:string; date:string; kind:'free-day'};
export type AgendaEntry = Meeting | FreeDay;
export const isoDate = (date:Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const demoToday = isoDate(today);
export const initialRaces: Race[] = [
  {id:'race-parque', name:'Circuito Parque Verde', date:'2026-10-25', distances:['3 km','5 km','10 km'], location:'', participants:[{studentId:'1',distance:'5 km'},{studentId:'2',distance:'10 km'},{studentId:'3',distance:'3 km'},...['5','7','9','11'].map(studentId=>({studentId,distance:'10 km'}))]},
  {id:'race-primavera', name:'Meia da Primavera', date:'2026-11-08', distances:['21 km'], location:'', participants:['2','4','6','8'].map(studentId=>({studentId,distance:'21 km'}))}
];
export const initialAgenda: AgendaEntry[] = [
  {id:'meet-1',kind:'meeting',type:'training',date:'2026-10-06',time:'05:20',location:'Canal do Boi Brasa',title:'',notes:'Próximo à Casa Coral'},
  {id:'meet-2',kind:'meeting',type:'training',date:'2026-10-06',time:'18:20',location:'Plínio Lemos',title:'',notes:''},
  {id:'meet-3',kind:'meeting',type:'training',date:'2026-10-08',time:'05:20',location:'Plínio Lemos',title:'',notes:''},
  {id:'meet-4',kind:'meeting',type:'training',date:'2026-10-08',time:'18:20',location:'Açude Velho',title:'',notes:'Em frente ao São Vicente'},
  {id:'meet-5',kind:'meeting',type:'long-run',date:'2026-10-11',time:'06:00',location:'Parque da Criança',title:'Longão coletivo',notes:'Concentração ao lado do parque'},
  {id:'free-sunday-example',kind:'free-day',date:'2026-10-18'}
];
export const futureRaces = (races:Race[], from=demoToday) => races.filter(r=>r.date>=from).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
export const nextRaceFor = (races:Race[], studentId:string, from=demoToday) => futureRaces(races,from).find(r=>r.participants.some(p=>p.studentId===studentId));
export const racesForStudent = (races:Race[], id:string) => races.filter(r=>r.participants.some(p=>p.studentId===id));
export const entriesForWeek = (entries:AgendaEntry[], week:number) => entries.filter(e=>e.date>=isoDate(weekDate(week,0))&&e.date<=isoDate(weekDate(week,6))).sort((a,b)=>a.date.localeCompare(b.date)||('time' in a?a.time:'').localeCompare('time' in b?b.time:''));
export const entryWeek = (date:string) => Math.floor((Date.parse(`${date}T12:00:00Z`)-Date.parse('2026-10-05T12:00:00Z'))/(7*86400000));
export function agendaConflict(entry:AgendaEntry, entries:AgendaEntry[]):string {
  if(entries.some(e=>e.id!==entry.id&&e.date===entry.date&&(e.kind==='free-day'||entry.kind==='free-day'))) return 'Este dia já tem um encontro ou dia livre. Edite ou exclua esse registro primeiro.';
  return '';
}
type LegacyStudent = Student & {race?:string;raceDate?:string;raceDistance?:string};
export function migrateRaces(people:LegacyStudent[]):Race[] {
  const events = new Map<string,Race>();
  for(const person of people) {
    if(!person.race?.trim()||!person.raceDate) continue;
    const name=person.race.trim(), date=person.raceDate, distance=person.raceDistance?.trim()||'';
    const key=JSON.stringify([normalize(name),date]);
    const event=events.get(key) || {id:`legacy-${encodeURIComponent(key)}`,name,date,distances:[],location:'',participants:[]};
    if(distance&&!event.distances.includes(distance))event.distances.push(distance);
    if(!event.participants.some(p=>p.studentId===person.id)) event.participants.push({studentId:person.id,distance});
    events.set(key,event);
  }
  return [...events.values()];
}
export function normalizeSchedule(schedule:Schedule):Schedule {
  return Object.fromEntries(Object.entries(schedule).map(([key,items])=>[key,items.map(workout=>{
    const {location,...prescription}=workout as Workout & {location?:string};
    // Undo only the exact illustrative Sunday added by V5.1. Keep edited workouts.
    if(key==='1:1:6'&&prescription.id==='1-1-6'&&prescription.title==='Treino livre'&&prescription.notes==='Faça no horário e local de sua preferência.')
      return {...prescription,title:templates[1].title,notes:'',titleCustomized:false};
    return prescription;
  })]));
}

export const meetingTypes = {training:'Treino coletivo','long-run':'Longão coletivo',event:'Evento / confraternização'} as const;
export const participantDistance = (race:Race, studentId:string) => race.participants.find(p=>p.studentId===studentId)?.distance || 'Distância a definir';
export function normalizeRaces(records:Race[]):Race[] {
  const grouped=new Map<string,Race>();
  for(const record of records) {
    const old=record as Race & {distance?:string;participantIds?:string[]};
    const distances=[...new Set((record.distances ?? [old.distance||'']).map(d=>d.trim()).filter(Boolean))];
    const participants=record.participants ?? (old.participantIds||[]).map(studentId=>({studentId,distance:old.distance||''}));
    const key=JSON.stringify([normalize(record.name.trim()),record.date]);
    const existing=grouped.get(key);
    const race:Race=existing || {id:record.id,name:record.name,date:record.date,location:record.location||'',distances:[],participants:[]};
    race.distances=[...new Set([...race.distances,...distances,...participants.map(p=>p.distance).filter(Boolean)])];
    for(const participant of participants) if(!race.participants.some(p=>p.studentId===participant.studentId))race.participants.push({...participant});
    grouped.set(key,race);
  }
  return [...grouped.values()];
}
export function normalizeAgenda(records:AgendaEntry[]):AgendaEntry[] {
  return records.map(record=>{
    const legacy=record as unknown as {kind:string};
    if(legacy.kind==='free-sunday'||record.kind==='free-day')return {id:record.id,date:record.date,kind:'free-day'};
    const meeting=record as Meeting;
    return {...meeting,type:meeting.type || (normalize(meeting.title).includes('longao')?'long-run':'training')};
  });
}
