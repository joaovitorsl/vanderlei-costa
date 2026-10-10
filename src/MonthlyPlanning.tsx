import {ChevronLeft,ChevronRight,type LucideIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {initials,goalLabel,type Student,type Schedule} from './data';
import {planningMonthDate,monthlyPlanning,planningLabels} from './monthlyPlanningData';
type Props={people:Student[];schedule:Schedule;monthOffset:number;onMonth:(month:number)=>void;pendingOnly:boolean;onPending:(pending:boolean)=>void;search:ReactNode;hasQuery:boolean;onChoose:(id:string,week:number)=>void};
export default function MonthlyPlanning({people,schedule,monthOffset,onMonth,pendingOnly,onPending,search,hasQuery,onChoose}:Props){
  const month=planningMonthDate(monthOffset);
  const list=people.filter(p=>p.status==='Ativo').map(student=>({student,...monthlyPlanning(schedule,student.id,month)})).filter(p=>!pendingOnly||p.status!=='complete');
  const arrow=(label:string,delta:number,Icon:LucideIcon)=><button className="icon-button" aria-label={label} onClick={()=>onMonth(monthOffset+delta)}><Icon size={22}/></button>;
  return <><div className="page-title"><div><h1>Treinos</h1><p>Planejamento mensal dos alunos ativos</p></div></div>
    <div className="month-toolbar"><div className="week-navigation">{arrow('Mês anterior',-1,ChevronLeft)}<strong className="month-name" aria-live="polite">{month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</strong>{arrow('Próximo mês',1,ChevronRight)}</div></div>
    <p className="planning-note">Mês planejado: todas as terças, quintas e domingos com treino.</p>
    {search}<div className="planning-filters" role="group" aria-label="Filtrar planejamento">{[false,true].map(pending=><button key={String(pending)} aria-pressed={pendingOnly===pending} onClick={()=>onPending(pending)}>{pending?'Pendentes':'Todos'}</button>)}</div>
    <div className="student-list">{list.map(({student,status,week})=><button className="student-row" key={student.id} onClick={()=>onChoose(student.id,week)}><span className={`avatar tone-${student.name.length%4}`}>{initials(student.name)}</span><span className="row-text"><strong>{student.name}</strong><small>{goalLabel(student)} · {student.level}</small></span><span className="student-meta"><span className={`planning-status planning-${status}`}>{planningLabels[status]}</span></span><ChevronRight size={19} className="chevron"/></button>)}{!list.length&&<p className="empty">{hasQuery?'Nenhum aluno encontrado para esta busca.':pendingOnly?'Nenhum aluno pendente neste mês.':'Nenhum aluno ativo cadastrado.'}</p>}</div>
  </>;
}
