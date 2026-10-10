import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commercialPlans, students, normalizeStudent, dueDayThisMonth, planPrice, type Student} from '../src/data.ts';

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
