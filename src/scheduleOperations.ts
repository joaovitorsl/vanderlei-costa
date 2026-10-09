import {days, scheduleKey, type Schedule, type Workout} from './data.ts';

// Explicit destination keeps session operations independent from the navigation UI.
// Only same-day duplication is exposed in this prototype.
export type WorkoutLocation = {studentId: string; week: number; day: number};
const keyFor = (location: WorkoutLocation) => scheduleKey(location.studentId, location.week, location.day);
export const cloneWorkout = (source: Workout): Workout => ({...source, id: crypto.randomUUID()});

export function saveSession(schedule: Schedule, location: WorkoutLocation, workout: Workout, editing: boolean): Schedule {
  const key = keyFor(location);
  const current = schedule[key] || [];
  return {...schedule, [key]: editing ? current.map(w => w.id === workout.id ? {...workout} : w) : [...current, {...workout}]};
}

export function duplicateSession(schedule: Schedule, location: WorkoutLocation, workout: Workout): Schedule {
  return saveSession(schedule, location, cloneWorkout(workout), false);
}

export function deleteSession(schedule: Schedule, location: WorkoutLocation, id: string): Schedule {
  const key = keyFor(location);
  return {...schedule, [key]: (schedule[key] || []).filter(w => w.id !== id)};
}

export function duplicatePreviousWeek(schedule: Schedule, studentId: string, week: number): {schedule: Schedule; count: number} {
  const next = {...schedule};
  let count = 0;
  for (const day of days) {
    const copies = (schedule[scheduleKey(studentId, week - 1, day)] || []).map(cloneWorkout);
    if (!copies.length) continue;
    const key = scheduleKey(studentId, week, day);
    next[key] = [...(schedule[key] || []), ...copies];
    count += copies.length;
  }
  return {schedule: next, count};
}
