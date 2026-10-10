import {seedAssessments, type AssessmentBook} from './assessmentData.ts';
import {students, initialSchedule, normalizeStudent, type Student, type Schedule} from './data.ts';
import {initialRaces, initialAgenda, migrateRaces, normalizeRaces, normalizeAgenda, normalizeSchedule, type Race, type AgendaEntry} from './collectiveData.ts';
import type {WeekCopies} from './scheduleOperations.ts';
export const demoKeys = {students:'vc-students-v3', schedule:'vc-schedule-v3', copies:'vc-week-copies-v5', races:'vc-races-v1', agenda:'vc-agenda-v1', assessments:'vc-assessments-v1'};
export function loadDemo(storage:Pick<Storage,'getItem'>, reset=false) {
  const read=<T,>(key:string, fallback:T):T=>{try {return reset?fallback:JSON.parse(storage.getItem(key)||'null')??fallback;}catch{return fallback;}};
  const previous=read<Student[]|null>(demoKeys.students,null);
  // Read legacy race fields before normalizing people; events become the only source of truth.
  const races=read<Race[]|null>(demoKeys.races,null) ?? (previous ? migrateRaces(previous) : initialRaces);
  return {people:(previous||students).map(normalizeStudent), races:normalizeRaces(races), assessments:read<AssessmentBook>(demoKeys.assessments,seedAssessments(previous||students)),
    schedule:normalizeSchedule(read<Schedule>(demoKeys.schedule,initialSchedule)),
    copies:read<WeekCopies>(demoKeys.copies,{}), agenda:normalizeAgenda(read<AgendaEntry[]>(demoKeys.agenda,initialAgenda))};
}
export function resetDemo(url: URL, storage: Pick<Storage, 'removeItem'>, replace: (url: string) => void): boolean {
  if (url.searchParams.get('resetDemo') !== '1') return false;
  for (const key of Object.values(demoKeys)) {
    try { storage.removeItem(key); } catch { /* Seed still loads for this session. */ }
  }
  url.searchParams.delete('resetDemo');
  replace(url.pathname + url.search + url.hash);
  return true;
}
