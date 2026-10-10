import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commercialPlans, students, normalizeStudent, dueDayThisMonth, planPrice, initialSchedule, type Student} from '../src/data.ts';
import {changeWorkoutType, cleanWorkout} from '../src/workoutState.ts';
import {duplicatePreviousWeek, duplicateSession} from '../src/scheduleOperations.ts';

test('commercial plans use their actual prices and independent modality', () => {
  const rafael = students[1];
  assert.equal(rafael.plan, 'Fire');
  assert.equal(rafael.modality, 'Corrida de rua');
  assert.equal(rafael.value, 420);
  assert.equal(rafael.goal, '21 km');
  assert.equal(rafael.value / commercialPlans.Fire.months, 70);
  assert.match(planPrice(rafael), /420.*6 meses/);
  assert.equal(commercialPlans.Lite.value, 80);
  assert.equal(commercialPlans.Família.value, 150);
});
test('legacy students migrate once while preserving personalized data', () => {
  const legacy = {...students[1], plan:'Corrida', value:80, modality:undefined, renewalDate:undefined, name:'Nome editado', notes:'Anotação preservada'} as unknown as Student;
  const migrated = normalizeStudent(legacy);
  assert.equal(migrated.plan,'Fire'); assert.equal(migrated.value,420);
  assert.equal(migrated.name,legacy.name); assert.equal(migrated.notes,legacy.notes);
  assert.equal(migrated.modality,'Corrida de rua'); assert.equal(migrated.renewalDate,'2026-10-10');
  assert.deepEqual(normalizeStudent(migrated),migrated);
  const customized = {...migrated,value:400,renewalDate:'2027-04-10'};
  assert.deepEqual(normalizeStudent(customized),customized);
});
test('Fire renewal uses its date instead of repeating every month', () => {
  assert.equal(dueDayThisMonth(students[1]),10);
  assert.equal(dueDayThisMonth({...students[1],renewalDate:'2027-04-10'}),0);
  assert.equal(dueDayThisMonth({...students[1],renewalDate:''}),0);
  assert.equal(dueDayThisMonth(students[0]),10);
});
test('optional location survives type changes, saving and both duplication paths', () => {
  const source = {...initialSchedule['2:0:1'][0], location:'Canal de Bodocongó'};
  for (const type of ['Tiros','Intervalado por tempo','Rodagem']) {
    assert.equal(cleanWorkout(changeWorkoutType(source,type)).location,source.location);
  }
  const schedule = {'2:0:1':[source]};
  assert.equal(duplicateSession(schedule,{studentId:'2',week:0,day:1},source)['2:0:1'][1].location,source.location);
  assert.equal(duplicatePreviousWeek(schedule,'2',1).schedule['2:1:1'][0].location,source.location);
  assert.equal(cleanWorkout({...source,location:''}).location,'');
});
test('free Sunday uses an existing workout type and manual instructions', () => {
  const sunday = initialSchedule['1:1:6'][0];
  assert.equal(sunday.type,'Rodagem'); assert.equal(sunday.title,'Treino livre');
  assert.equal(sunday.notes,'Faça no horário e local de sua preferência.');
});
