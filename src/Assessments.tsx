import {useState, type FormEvent} from 'react';
import {Plus, Check, ChevronRight} from 'lucide-react';
import Modal from './Modal';
import {dateLabel, type Student} from './data';
import {demoToday} from './collectiveData';
import {type Assessment} from './assessmentData';
import {formErrors} from './formValidation';

type Props={student:Student;items:Assessment[];onChange:(items:Assessment[])=>void;notify:(message:string)=>void;onOpen:()=>void};
export default function Assessments({student,items,onChange,notify,onOpen}:Props) {
  const [editing,setEditing]=useState<Assessment|null>(null),[deleting,setDeleting]=useState<Assessment|null>(null);
  const edit=(item:Assessment)=>{onOpen();setEditing(item);};
  return <><div className="page-title assessment-heading"><div><h1>Avaliações</h1><p>Histórico de {student.name.split(' ')[0]}</p></div><button className="primary" onClick={()=>edit({id:crypto.randomUUID(),date:demoToday,type:'1600 m',name:'',time:'',hr:'',notes:''})}><Plus size={18}/> Nova avaliação</button></div>
    <p className="subtle-note">Registre os resultados da avaliação. Nenhum cálculo de VO₂ é realizado.</p>
    <div className="assessment-list">{[...items].sort((a,b)=>b.date.localeCompare(a.date)).map((a,i)=><details key={a.id} open={i===0}><summary><span><small>{dateLabel(a.date)}</small><strong>{a.type==='Outro'?a.name:a.type}</strong></span><span className="assessment-value">{a.vo2||a.time}<small>{a.vo2?'VO₂ máx · exemplo':'Tempo · min:seg'}</small></span><ChevronRight size={18}/></summary><dl><div><dt>Tempo</dt><dd>{a.time}</dd></div>{a.hr&&<div><dt>FC máxima</dt><dd>{a.hr} bpm</dd></div>}{a.notes&&<div className="assessment-notes"><dt>Observações</dt><dd>{a.notes}</dd></div>}</dl><div className="event-actions race-actions"><button className="text-button" onClick={()=>edit(a)}>Editar avaliação</button><button className="text-button danger-text" onClick={()=>{onOpen();setDeleting(a);}}>Excluir avaliação</button></div></details>)}</div>
    {!items.length&&<p className="empty">Nenhuma avaliação registrada.</p>}
    {editing&&<AssessmentForm initial={editing} editing={items.some(a=>a.id===editing.id)} onClose={()=>setEditing(null)} onSave={item=>{const exists=items.some(a=>a.id===item.id);onChange(exists?items.map(a=>a.id===item.id?item:a):[...items,item]);setEditing(null);notify(exists?'Avaliação atualizada.':'Avaliação registrada.');}}/>}
    {deleting&&<Modal compact title="Excluir avaliação?" onClose={()=>setDeleting(null)}><p>{deleting.type==='Outro'?deleting.name:deleting.type} · {dateLabel(deleting.date)}</p><div className="sheet-actions"><button className="secondary" onClick={()=>setDeleting(null)}>Cancelar</button><button className="danger-button" onClick={()=>{onChange(items.filter(a=>a.id!==deleting.id));setDeleting(null);notify('Avaliação excluída.');}}>Excluir avaliação</button></div></Modal>}
  </>;
}
function AssessmentForm({initial,editing,onClose,onSave}:{initial:Assessment;editing:boolean;onClose:()=>void;onSave:(item:Assessment)=>void}) {
  const [draft,setDraft]=useState(initial),[errors,setErrors]=useState<Record<string,string>>({});
  const update=(key:keyof Assessment,value:string)=>{setDraft(d=>({...d,[key]:value}));setErrors(e=>({...e,[key]:''}));};
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const next=formErrors(e.currentTarget);setErrors(next);if(Object.keys(next).length)return;const {vo2,...result}=draft;onSave({...result,name:draft.type==='Outro'?draft.name.trim():'',notes:draft.notes.trim()});}
  const error=(key:string)=>errors[key]&&<span className="field-error" id={`assessment-${key}-error`} role="alert">{errors[key]}</span>;
  return <Modal fullScreenOnMobile stickyFooter title={editing?'Editar avaliação':'Nova avaliação'} onClose={onClose}><form noValidate onSubmit={submit}><div className="form-fields">
    <label>Data<input name="date" type="date" required value={draft.date} onChange={e=>update('date',e.target.value)} aria-invalid={!!errors.date} aria-describedby={errors.date?'assessment-date-error':undefined}/>{error('date')}</label>
    <label>Tipo de avaliação<select name="type" value={draft.type} onChange={e=>update('type',e.target.value)}>{['1600 m','2400 m','Outro'].map(type=><option key={type}>{type}</option>)}</select></label>
    {draft.type==='Outro'&&<label className="full">Nome da avaliação<input name="name" required value={draft.name} onChange={e=>update('name',e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name?'assessment-name-error':undefined}/>{error('name')}</label>}
    <label>Tempo (min:seg)<input name="time" required placeholder="Ex.: 10:42" pattern="[0-9]{1,3}:[0-5][0-9]" value={draft.time} onChange={e=>update('time',e.target.value)} aria-invalid={!!errors.time} aria-describedby={errors.time?'assessment-time-error':undefined}/>{error('time')}</label>
    <label>FC máxima <span className="optional">opcional · bpm</span><input name="hr" type="number" min="1" step="1" value={draft.hr} onChange={e=>update('hr',e.target.value)} aria-invalid={!!errors.hr} aria-describedby={errors.hr?'assessment-hr-error':undefined}/>{error('hr')}</label>
    <label className="full">Observações <span className="optional">opcional</span><textarea name="notes" value={draft.notes} onChange={e=>update('notes',e.target.value)}/></label>
    </div><div className="sheet-actions"><button type="button" className="quiet-button" onClick={onClose}>Cancelar</button><button className="primary"><Check size={18}/> Salvar avaliação</button></div></form></Modal>;
}
