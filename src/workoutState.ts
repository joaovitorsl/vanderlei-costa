import {templates, type Workout} from './data.ts';
export type NumberField = 'distance' | 'reps' | 'duration' | 'rest' | 'warmup' | 'cooldown';
export type Draft = Omit<Workout, NumberField> & Record<NumberField, number | ''>;
export function cleanWorkout<T extends Draft>(workout: T): T {
  if (workout.type === 'Rodagem') return {...workout, reps:0, duration:0, rest:0, target:''};
  if (workout.type === 'Tiros') return {...workout, duration:0, pace:''};
  return {...workout, distance:0, target:'', pace:''};
}
export function changeWorkoutType(workout: Draft, type: string): Draft {
  if (type === workout.type) return workout;
  const defaults = type === 'Rodagem' ? {distance:5, pace:'6:30'} : type === 'Tiros' ? {reps:6, distance:200, target:'50 s', rest:1} : {reps:6, duration:2, rest:1};
  const automaticTitle = !workout.titleCustomized && (workout.title === workout.type || templates.some(model => model.type === workout.type && model.title === workout.title));
  return cleanWorkout({...workout, type, ...defaults, title:automaticTitle ? type : workout.title});
}
