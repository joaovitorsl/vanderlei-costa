import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialSchedule, templates, scheduleKey, days, dateLabel} from '../src/data.ts';
import {duplicatePreviousWeek, hasCopiedPreviousWeek, deleteSession, duplicateSession} from '../src/scheduleOperations.ts';
import {cleanWorkout, changeWorkoutType} from '../src/workoutState.ts';
import {demoKeys, resetDemo} from '../src/demoStorage.ts';

test('week copy is additive, immutable and tracked independently of names', () => {
  const original = structuredClone(initialSchedule);
  const first = duplicatePreviousWeek(initialSchedule, '2', 0);
  assert.equal(first.count, 3);
  for(const day of days) {
    const key = scheduleKey('2',0,day);
    assert.equal(first.schedule[key].length, 2);
    assert.deepEqual(first.schedule[key][0], initialSchedule[key][0]);
    assert.notEqual(first.schedule[key][1].id, initialSchedule[scheduleKey('2',-1,day)][0].id);
  }
  assert.deepEqual(initialSchedule, original);
  assert.equal(hasCopiedPreviousWeek(first.schedule, {}, '2', 0), true);
  assert.equal(hasCopiedPreviousWeek(first.schedule, {}, '1', 0), false);
  assert.equal(hasCopiedPreviousWeek(first.schedule, {}, '2', 1), false);
  const second = duplicatePreviousWeek(first.schedule,'2',0);
  assert.equal(second.count,3);
  assert.equal(second.schedule['2:0:1'].length,3);
  assert.equal(hasCopiedPreviousWeek({}, {'2:0':-1}, '2',0),true);
  assert.equal(duplicatePreviousWeek({},'2',0).count,0);
});
test('individual operations preserve other days and original session',()=>{
  const location = {studentId:'2',week:0,day:1};
  const copy = duplicateSession(initialSchedule,location,initialSchedule['2:0:1'][0]);
  assert.equal(copy['2:0:1'].length,2);
  assert.deepEqual(deleteSession(copy,location,copy['2:0:1'][1].id),initialSchedule);
});
test('types discard incompatible values and models remain unchanged',()=>{
  const original=structuredClone(templates);
  const tiros=templates[2];
  const interval=changeWorkoutType(tiros,'Intervalado por tempo');
  assert.equal(interval.distance,0); assert.equal(interval.target,''); assert.equal(interval.pace,'');
  const run=changeWorkoutType(interval,'Rodagem');
  assert.equal(run.duration,0);assert.equal(run.reps,0);assert.equal(run.rest,0);
  assert.equal(cleanWorkout(tiros).duration,0);
  assert.deepEqual(templates,original);
});
test('reset removes only demo keys and its URL parameter, including blocked storage',()=>{
  const removed:string[]=[];let replaced='';
  assert.equal(resetDemo(new URL('https://example.com/app/?foo=bar&resetDemo=1#mobile'),{removeItem:key=>{removed.push(key)}},url=>{replaced=url}),true);
  assert.deepEqual(removed,Object.values(demoKeys));assert.equal(replaced,'/app/?foo=bar#mobile');
  assert.equal(resetDemo(new URL('https://example.com/?resetDemo=0'),{removeItem:()=>assert.fail()},()=>assert.fail()),false);
  assert.equal(resetDemo(new URL('https://example.com/?resetDemo=1'),{removeItem:()=>{throw Error()}},()=>{}),true);
});
test('missing and invalid dates have a neutral label',()=>{
 assert.equal(dateLabel(''),'Não informada');assert.equal(dateLabel('broken'),'Não informada');
});
