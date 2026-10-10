import {today, weekDate, scheduleKey, type Schedule} from './data.ts';
export type PlanningStatus = 'empty' | 'partial' | 'complete';
export const planningLabels:Record<PlanningStatus,string>={empty:'Sem prescrição',partial:'Parcial',complete:'Mês planejado'};
export const planningMonthDate=(offset:number)=>new Date(today.getFullYear(),today.getMonth()+offset,1,12);
export function monthSlots(month:Date) {
  const start=weekDate(0,0);
  const epoch=Date.UTC(start.getFullYear(),start.getMonth(),start.getDate());
  const slots:{week:number;day:number}[]=[];
  for(let date=new Date(month.getFullYear(),month.getMonth(),1,12);date.getMonth()===month.getMonth();date.setDate(date.getDate()+1)) {
    const day=(date.getDay()+6)%7;
    if(![1,3,6].includes(day))continue;
    const week=Math.floor((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-epoch)/(7*86400000));
    slots.push({week,day});
  }
  return slots;
}
export function monthlyPlanning(schedule:Schedule,studentId:string,month:Date) {
  const slots=monthSlots(month);
  const missing=slots.filter(slot=>!(schedule[scheduleKey(studentId,slot.week,slot.day)]||[]).length);
  const status:PlanningStatus=missing.length===slots.length?'empty':missing.length?'partial':'complete';
  return {status,week:(missing[0]||slots[0]).week};
}
