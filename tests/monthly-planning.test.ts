import {test} from 'node:test';
import assert from 'node:assert/strict';
import {monthSlots,monthlyPlanning} from '../src/monthlyPlanningData.ts';
import {weekDate,scheduleKey,templates,type Schedule} from '../src/data.ts';
test('month includes every Tuesday, Thursday and Sunday, including month/year edges and leap February',()=>{
 for(const [year,month] of [[2026,9],[2026,11],[2027,0],[2028,1]]){
  const slots=monthSlots(new Date(year,month,1,12));
  const expected=[];
  for(let day=1;day<=new Date(year,month+1,0).getDate();day++)if([0,2,4].includes(new Date(year,month,day).getDay()))expected.push(day);
  const dates=slots.map(s=>weekDate(s.week,s.day));
  assert.deepEqual(dates.map(d=>d.getDate()),expected);
  assert.ok(dates.every(d=>d.getMonth()===month&&d.getFullYear()===year));
 }
});
test('status needs every prescribed day, ignores duplicate sessions and other months/students',()=>{
 const month=new Date(2026,9,1,12),slots=monthSlots(month),schedule:Schedule={};
 assert.equal(monthlyPlanning(schedule,'1',month).status,'empty');
 for(const slot of slots)schedule[scheduleKey('1',slot.week,slot.day)]=[{...templates[0]}];
 assert.equal(monthlyPlanning(schedule,'1',month).status,'complete');
 assert.equal(monthlyPlanning(schedule,'2',month).status,'empty');
 assert.equal(monthlyPlanning(schedule,'1',new Date(2026,10,1,12)).status,'empty');
 const missing=slots[slots.length-1];delete schedule[scheduleKey('1',missing.week,missing.day)];
 schedule[scheduleKey('1',slots[0].week,slots[0].day)].push({...templates[1]});
 assert.equal(monthlyPlanning(schedule,'1',month).status,'partial');
 assert.equal(monthlyPlanning(schedule,'1',month).week,missing.week);
});
