import {assessments, type Student} from './data.ts';
export type Assessment = {id:string;date:string;type:'1600 m'|'2400 m'|'Outro';name:string;time:string;hr:string;notes:string;vo2?:string};
export type AssessmentBook = Record<string,Assessment[]>;
export function seedAssessments(people:Student[]):AssessmentBook {
  return Object.fromEntries(people.map(person=>[person.id,assessments.map((a,index)=>({id:`${person.id}-assessment-${index}`,date:a.date,type:a.type as Assessment['type'],name:a.type==='Outro'?a.distance:'',time:a.time,hr:a.hr,notes:'',vo2:a.vo2}))]));
}
