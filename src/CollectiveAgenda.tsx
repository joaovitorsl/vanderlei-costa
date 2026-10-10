import {useState, type FormEvent} from 'react';
import {Plus, ChevronLeft, ChevronRight, Check} from 'lucide-react';
import Modal from './Modal';
import {weekDate, shortDate, dateLabel} from './data';
import {entriesForWeek, isoDate, entryWeek, agendaConflict, type AgendaEntry} from './collectiveData';
import {formErrors} from './formValidation';

type Props={entries:AgendaEntry[]; onChange:(entries:AgendaEntry[])=>void; notify:(message:string)=>void; onOpen:()=>void};
export default function CollectiveAgenda({entries,onChange,notify,onOpen}:Props) {
  const [week,setWeek]=useState(0), [editing,setEditing]=useState<AgendaEntry|null>(null), [deleting,setDeleting]=useState<AgendaEntry|null>(null);
  const visible=entriesForWeek(entries,week);
  const dates=[...new Set(visible.map(e=>e.date))];
  const edit=(entry:AgendaEntry)=>{onOpen();setEditing(entry);};
  return <>
    <div className="week-toolbar"><div className="week-navigation"><button className="icon-button" aria-label="Semana anterior" onClick={()=>setWeek(week-1)}><ChevronLeft size={22}/></button><div><span>SEMANA</span><strong>{shortDate(weekDate(week,0))} — {shortDate(weekDate(week,6))}<small>{weekDate(week,0).getFullYear()}</small></strong></div><button className="icon-button" aria-label="Próxima semana" onClick={()=>setWeek(week+1)}><ChevronRight size={22}/></button></div></div>
    {week!==0&&<button className="text-button current-week" onClick={()=>setWeek(0)}>Voltar para esta semana</button>}
    <button className="secondary agenda-add" onClick={()=>edit({id:crypto.randomUUID(),kind:'meeting',date:isoDate(weekDate(week,1)),time:'',location:'',title:'',notes:''})}><Plus size={18}/> Adicionar encontro</button>
    <div className="agenda-days">{dates.map(date=><section key={date} className="agenda-day"><h2>{new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long'}).replace('-feira','')} {Number(date.slice(8))}</h2><div className="row-group">{visible.filter(e=>e.date===date).map(entry=><article className="agenda-entry" key={entry.id}>
      {entry.kind==='meeting'?<><time>{entry.time}</time><div className="row-text"><strong>{entry.title||entry.location}</strong>{entry.title&&<span>{entry.location}</span>}{entry.notes&&<small>{entry.notes}</small>}</div></>:<div className="row-text"><strong>Domingo livre</strong><small>Treino individual no horário e local de sua preferência.</small></div>}
      <div className="event-actions"><button className="text-button" aria-label={`Editar ${entry.kind==='free-sunday'?'domingo livre':`${entry.time} · ${entry.title||entry.location}`}`} onClick={()=>edit(entry)}>Editar</button><button className="text-button danger-text" aria-label={`Excluir ${entry.kind==='free-sunday'?'domingo livre':`${entry.time} · ${entry.title||entry.location}`}`} onClick={()=>{onOpen();setDeleting(entry);}}>Excluir</button></div>
    </article>)}</div></section>)}</div>
    {!visible.length&&<p className="empty">Nenhum encontro cadastrado nesta semana.</p>}
    {editing&&<MeetingForm initial={editing} entries={entries} onClose={()=>setEditing(null)} onSave={entry=>{const exists=entries.some(e=>e.id===entry.id);onChange(exists?entries.map(e=>e.id===entry.id?entry:e):[...entries,entry]);setWeek(entryWeek(entry.date));setEditing(null);notify(exists?'Agenda atualizada.':'Registro adicionado à agenda.');}}/>}
    {deleting&&<Modal compact title={deleting.kind==='free-sunday'?'Excluir domingo livre?':'Excluir encontro?'} onClose={()=>setDeleting(null)}><p className="delete-context">{dateLabel(deleting.date)}{deleting.kind==='meeting'?` · ${deleting.time} · ${deleting.title||deleting.location}`:''}</p><p className="subtle-note">Este registro será removido da agenda coletiva. As prescrições dos alunos serão mantidas.</p><div className="sheet-actions"><button className="secondary" onClick={()=>setDeleting(null)}>Cancelar</button><button className="danger-button" onClick={()=>{onChange(entries.filter(e=>e.id!==deleting.id));setDeleting(null);notify('Registro excluído da agenda.');}}>Excluir</button></div></Modal>}
  </>;
}
function MeetingForm({initial,entries,onClose,onSave}:{initial:AgendaEntry;entries:AgendaEntry[];onClose:()=>void;onSave:(entry:AgendaEntry)=>void}) {
  const [draft,setDraft]=useState({kind:initial.kind,date:initial.date,time:initial.kind==='meeting'?initial.time:'',location:initial.kind==='meeting'?initial.location:'',title:initial.kind==='meeting'?initial.title:'',notes:initial.kind==='meeting'?initial.notes:''});
  const [errors,setErrors]=useState<Record<string,string>>({});
  const isFree=draft.kind==='free-sunday';
  const update=(name:string,value:string)=>{setDraft(d=>({...d,[name]:value}));setErrors(e=>({...e,[name]:'',conflict:''}));};
  function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();const next=formErrors(e.currentTarget);
    const entry:AgendaEntry=isFree?{id:initial.id,kind:'free-sunday',date:draft.date}:{...draft,id:initial.id,kind:'meeting',title:draft.title.trim(),location:draft.location.trim(),notes:draft.notes.trim()};
    if(!Object.keys(next).length) {const conflict=agendaConflict(entry,entries);if(conflict)next.conflict=conflict;}
    setErrors(next);if(!Object.keys(next).length)onSave(entry);
  }
  return <Modal fullScreenOnMobile stickyFooter title={entries.some(e=>e.id===initial.id)?'Editar agenda':'Adicionar encontro'} onClose={onClose}><form noValidate onSubmit={submit}><div className="form-fields">
    <label className="full">Tipo de registro<select name="kind" value={draft.kind} onChange={e=>update('kind',e.target.value)}><option value="meeting">Encontro coletivo</option><option value="free-sunday">Domingo livre</option></select></label>
    {([{key:'date',label:'Data',type:'date',required:true},...(!isFree?[{key:'time',label:'Horário',type:'time',required:true},{key:'location',label:'Local',type:'text',required:true},{key:'title',label:'Título',type:'text',required:false}]:[])] as const).map(f=><label key={f.key} className={f.type==='text'?'full':''}>{f.label}{!f.required&&<span className="optional">opcional</span>}<input name={f.key} type={f.type} required={f.required} value={draft[f.key as keyof typeof draft]} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key]?`meeting-${f.key}-error`:undefined} onChange={e=>update(f.key,e.target.value)}/>{errors[f.key]&&<span id={`meeting-${f.key}-error`} className="field-error" role="alert">{errors[f.key]}</span>}</label>)}
    {!isFree&&<label className="full">Observação / referência <span className="optional">opcional</span><textarea name="notes" value={draft.notes} onChange={e=>update('notes',e.target.value)}/></label>}
    {isFree&&<p className="form-note full">Treino individual no horário e local de sua preferência.</p>}
    {errors.conflict&&<p className="field-error full" role="alert">{errors.conflict}</p>}
    </div><div className="sheet-actions"><button type="button" className="quiet-button" onClick={onClose}>Cancelar</button><button className="primary"><Check size={18}/> {isFree?'Salvar domingo livre':'Salvar encontro'}</button></div></form></Modal>;
}
