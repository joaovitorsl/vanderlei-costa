import {useState, type FormEvent, type ReactNode} from 'react';
import {Plus, Flag, ChevronRight, Check} from 'lucide-react';
import Modal from './Modal';
import {dateLabel, type Student} from './data';
import {demoToday, futureRaces, type Race} from './collectiveData';
import {formErrors} from './formValidation';

type Props={races:Race[];people:Student[];onChange:(races:Race[])=>void;studentList:(people:Student[])=>ReactNode;notify:(message:string)=>void;onOpen:()=>void};
export default function RaceEvents({races,people,onChange,studentList,notify,onOpen}:Props) {
  const [editing,setEditing]=useState<Race|null>(null),[deleting,setDeleting]=useState<Race|null>(null);
  const edit=(race:Race)=>{onOpen();setEditing(race);};
  const render=(events:Race[])=>events.map(r=>{const athletes=people.filter(p=>r.participantIds.includes(p.id));return <details key={r.id}><summary><Flag size={21}/><span><strong>{r.name}</strong><small>{dateLabel(r.date)} · {r.distance} · {athletes.length} {athletes.length===1?'atleta':'atletas'}</small>{r.location&&<small>{r.location}</small>}</span><ChevronRight size={18}/></summary>{athletes.length?studentList(athletes):<p className="empty">Nenhum participante vinculado.</p>}<div className="event-actions race-actions"><button className="text-button" onClick={()=>edit(r)}>Editar prova</button><button className="text-button danger-text" onClick={()=>{onOpen();setDeleting(r);}}>Excluir prova</button></div></details>;});
  const upcoming=futureRaces(races),past=races.filter(r=>r.date<demoToday).sort((a,b)=>b.date.localeCompare(a.date));
  return <>
    <button className="secondary agenda-add" onClick={()=>edit({id:crypto.randomUUID(),name:'',date:'',distance:'',location:'',participantIds:[]})}><Plus size={18}/> Nova prova</button>
    <div className="race-list">{render(upcoming)}{!upcoming.length&&<p className="empty">Nenhuma prova futura cadastrada.</p>}</div>
    {past.length>0&&<section className="detail-section"><h2>Provas anteriores</h2><div className="race-list">{render(past)}</div></section>}
    {editing&&<RaceForm initial={editing} editing={races.some(r=>r.id===editing.id)} people={people} onClose={()=>setEditing(null)} onSave={race=>{const exists=races.some(r=>r.id===race.id);onChange(exists?races.map(r=>r.id===race.id?race:r):[...races,race]);setEditing(null);notify(exists?'Prova atualizada.':'Prova cadastrada.');}}/>}
    {deleting&&<Modal compact title="Excluir prova?" onClose={()=>setDeleting(null)}><p className="delete-context">{deleting.name} · {dateLabel(deleting.date)}</p><p className="subtle-note">A prova e seus vínculos com participantes serão removidos. Os cadastros dos alunos serão mantidos.</p><div className="sheet-actions"><button className="secondary" onClick={()=>setDeleting(null)}>Cancelar</button><button className="danger-button" onClick={()=>{onChange(races.filter(r=>r.id!==deleting.id));setDeleting(null);notify('Prova excluída.');}}>Excluir prova</button></div></Modal>}
  </>;
}
function RaceForm({initial,editing,people,onClose,onSave}:{initial:Race;editing:boolean;people:Student[];onClose:()=>void;onSave:(race:Race)=>void}) {
  const [draft,setDraft]=useState({...initial,participantIds:[...initial.participantIds]}),[errors,setErrors]=useState<Record<string,string>>({});
  function submit(e:FormEvent<HTMLFormElement>) {e.preventDefault();const next=formErrors(e.currentTarget);setErrors(next);if(!Object.keys(next).length)onSave({...draft,name:draft.name.trim(),distance:draft.distance.trim(),location:draft.location.trim(),participantIds:[...new Set(draft.participantIds)].filter(id=>people.some(p=>p.id===id))});}
  return <Modal fullScreenOnMobile stickyFooter title={editing?'Editar prova':'Nova prova'} onClose={onClose}><form noValidate onSubmit={submit}><div className="form-fields">
    {([{key:'name',label:'Nome da prova',type:'text',required:true},{key:'date',label:'Data',type:'date',required:true},{key:'distance',label:'Distância',type:'text',required:true},{key:'location',label:'Local',type:'text',required:false}] as const).map(f=><label className={f.key==='name'||f.key==='location'?'full':''} key={f.key}>{f.label}{!f.required&&<span className="optional">opcional</span>}<input name={f.key} type={f.type} required={f.required} value={draft[f.key]} placeholder={f.key==='distance'?'Ex.: 21 km':undefined} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key]?`race-${f.key}-error`:undefined} onChange={e=>{setDraft(d=>({...d,[f.key]:e.target.value}));setErrors(err=>({...err,[f.key]:''}));}}/>{errors[f.key]&&<span id={`race-${f.key}-error`} className="field-error" role="alert">{errors[f.key]}</span>}</label>)}
    <fieldset className="participants full"><legend>Participantes</legend><p className="form-note">Selecione os alunos já cadastrados.</p><div className="participant-options">{people.map(person=><label key={person.id}><input type="checkbox" name="participantIds" value={person.id} checked={draft.participantIds.includes(person.id)} onChange={e=>setDraft(d=>({...d,participantIds:e.target.checked?[...d.participantIds,person.id]:d.participantIds.filter(id=>id!==person.id)}))}/><span>{person.name}<small>{person.status}</small></span></label>)}</div></fieldset>
    </div><div className="sheet-actions"><button type="button" className="quiet-button" onClick={onClose}>Cancelar</button><button className="primary"><Check size={18}/> Salvar prova</button></div></form></Modal>;
}
