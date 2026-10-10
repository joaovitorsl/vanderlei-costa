import {normalize, today, weekDate, templates, type Student, type Schedule, type Workout} from './data.ts';

export type Race = {id:string; name:string; date:string; distance:string; location:string; participantIds:string[]};
export type Meeting = {id:string; date:string; kind:'meeting'; time:string; location:string; title:string; notes:string};
export type FreeSunday = {id:string; date:string; kind:'free-sunday'};
export type AgendaEntry = Meeting | FreeSunday;
export const isoDate = (date:Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const demoToday = isoDate(today);
export const initialRaces: Race[] = [
  {id:'race-parque', name:'Circuito Parque Verde', date:'2026-10-25', distance:'10 km', location:'', participantIds:['1','3','5','7','9','11']},
  {id:'race-primavera', name:'Meia da Primavera', date:'2026-11-08', distance:'21 km', location:'', participantIds:['2','4','6','8']}
];
export const initialAgenda: AgendaEntry[] = [
  {id:'meet-1',kind:'meeting',date:'2026-10-06',time:'05:20',location:'Canal do Boi Brasa',title:'',notes:'Próximo à Casa Coral'},
  {id:'meet-2',kind:'meeting',date:'2026-10-06',time:'18:20',location:'Plínio Lemos',title:'',notes:''},
  {id:'meet-3',kind:'meeting',date:'2026-10-08',time:'05:20',location:'Plínio Lemos',title:'',notes:''},
  {id:'meet-4',kind:'meeting',date:'2026-10-08',time:'18:20',location:'Açude Velho',title:'',notes:'Em frente ao São Vicente'},
  {id:'meet-5',kind:'meeting',date:'2026-10-11',time:'06:00',location:'Parque da Criança',title:'Longão coletivo',notes:'Concentração ao lado do parque'},
  {id:'free-sunday-example',kind:'free-sunday',date:'2026-10-18'}
];
export const futureRaces = (races:Race[], from=demoToday) => races.filter(r=>r.date>=from).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
export const nextRaceFor = (races:Race[], studentId:string, from=demoToday) => futureRaces(races,from).find(r=>r.participantIds.includes(studentId));
export const racesForStudent = (races:Race[], id:string) => races.filter(r=>r.participantIds.includes(id));
export const entriesForWeek = (entries:AgendaEntry[], week:number) => entries.filter(e=>e.date>=isoDate(weekDate(week,0))&&e.date<=isoDate(weekDate(week,6))).sort((a,b)=>a.date.localeCompare(b.date)||('time' in a?a.time:'').localeCompare('time' in b?b.time:''));
export const entryWeek = (date:string) => Math.floor((Date.parse(`${date}T12:00:00Z`)-Date.parse('2026-10-05T12:00:00Z'))/(7*86400000));
export function agendaConflict(entry:AgendaEntry, entries:AgendaEntry[]):string {
  if(entry.kind==='free-sunday'&&new Date(`${entry.date}T12:00:00`).getDay()!==0) return 'Escolha um domingo para marcar como livre.';
  if(entries.some(e=>e.id!==entry.id&&e.date===entry.date&&(e.kind==='free-sunday'||entry.kind==='free-sunday'))) return 'Este dia já tem um encontro ou domingo livre. Edite ou exclua esse registro primeiro.';
  return '';
}
type LegacyStudent = Student & {race?:string;raceDate?:string;raceDistance?:string};
export function migrateRaces(people:LegacyStudent[]):Race[] {
  const events = new Map<string,Race>();
  for(const person of people) {
    if(!person.race?.trim()||!person.raceDate) continue;
    const name=person.race.trim(), date=person.raceDate, distance=person.raceDistance?.trim()||'';
    const key=JSON.stringify([normalize(name),date,normalize(distance)]);
    const event=events.get(key) || {id:`legacy-${encodeURIComponent(key)}`,name,date,distance,location:'',participantIds:[]};
    if(!event.participantIds.includes(person.id)) event.participantIds.push(person.id);
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
