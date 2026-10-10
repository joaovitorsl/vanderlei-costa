import {useState, type FormEvent, type ReactNode} from 'react';
import {Plus, Flag, ChevronRight, Check} from 'lucide-react';
import Modal from './Modal';
import {dateLabel, normalize, type Student} from './data';
import {demoToday, futureRaces, type Race} from './collectiveData';
import {formErrors} from './formValidation';

type Props={races:Race[];people:Student[];onChange:(races:Race[])=>void;studentList:(people:Student[],race:Race)=>ReactNode;notify:(message:string)=>void;onOpen:()=>void};
export default function RaceEvents({races,people,onChange,studentList,notify,onOpen}:Props) {
  const [editing,setEditing]=useState<Race|null>(null),[deleting,setDeleting]=useState<Race|null>(null);
  const edit=(race:Race)=>{onOpen();setEditing(race);};
  const render=(events:Race[])=>events.map(r=>{const athletes=people.filter(p=>r.participants.some(participant=>participant.studentId===p.id));return <details key={r.id}><summary><Flag size={21}/><span><strong>{r.name}</strong><small>{dateLabel(r.date)} · {r.distances.join(' / ')} · {athletes.length} {athletes.length===1?'atleta':'atletas'}</small>{r.location&&<small>{r.location}</small>}</span><ChevronRight size={18}/></summary>{athletes.length?studentList(athletes,r):<p className="empty">Nenhum participante vinculado.</p>}<div className="event-actions race-actions"><button className="text-button" onClick={()=>edit(r)}>Editar prova</button><button className="text-button danger-text" onClick={()=>{onOpen();setDeleting(r);}}>Excluir prova</button></div></details>;});
  const upcoming=futureRaces(races),past=races.filter(r=>r.date<demoToday).sort((a,b)=>b.date.localeCompare(a.date));
  return <>
    <button className="secondary agenda-add" onClick={()=>edit({id:crypto.randomUUID(),name:'',date:'',distances:[],location:'',participants:[]})}><Plus size={18}/> Nova prova</button>
    <div className="race-list">{render(upcoming)}{!upcoming.length&&<p className="empty">Nenhuma prova futura cadastrada.</p>}</div>
    {past.length>0&&<section className="detail-section"><h2>Provas anteriores</h2><div className="race-list">{render(past)}</div></section>}
    {editing&&<RaceForm initial={editing} races={races} editing={races.some(r=>r.id===editing.id)} people={people} onClose={()=>setEditing(null)} onSave={race=>{const exists=races.some(r=>r.id===race.id);onChange(exists?races.map(r=>r.id===race.id?race:r):[...races,race]);setEditing(null);notify(exists?'Prova atualizada.':'Prova cadastrada.');}}/>}
    {deleting&&<Modal compact title="Excluir prova?" onClose={()=>setDeleting(null)}><p className="delete-context">{deleting.name} · {dateLabel(deleting.date)}</p><p className="subtle-note">A prova e seus vínculos com participantes serão removidos. Os cadastros dos alunos serão mantidos.</p><div className="sheet-actions"><button className="secondary" onClick={()=>setDeleting(null)}>Cancelar</button><button className="danger-button" onClick={()=>{onChange(races.filter(r=>r.id!==deleting.id));setDeleting(null);notify('Prova excluída.');}}>Excluir prova</button></div></Modal>}
  </>;
}
function RaceForm({initial,editing,races,people,onClose,onSave}:{initial:Race;editing:boolean;races:Race[];people:Student[];onClose:()=>void;onSave:(race:Race)=>void}) {
  const [draft,setDraft]=useState({...initial,participants:initial.participants.map(p=>({...p}))}),[distanceText,setDistanceText]=useState(initial.distances.join(', ')),[errors,setErrors]=useState<Record<string,string>>({});
  const distances=[...new Map(distanceText.split(/[,;\n]/).map(d=>d.trim()).filter(Boolean).map(d=>[normalize(d),d])).values()];
  function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();const next=formErrors(e.currentTarget);
    if(!distances.length)next.distances='Informe ao menos uma distância.';
    if(races.some(r=>r.id!==draft.id&&normalize(r.name.trim())===normalize(draft.name.trim())&&r.date===draft.date))next.name='Esta prova já existe nesta data. Edite o registro existente para incluir distâncias.';
    setErrors(next);if(Object.keys(next).length){e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();return;}
    onSave({...draft,name:draft.name.trim(),distances,location:draft.location.trim(),participants:draft.participants.filter(p=>people.some(person=>person.id===p.studentId))});
  }
  return <Modal fullScreenOnMobile stickyFooter title={editing?'Editar prova':'Nova prova'} onClose={onClose}><form noValidate onSubmit={submit}><div className="form-fields">
    {([{key:'name',label:'Nome da prova',type:'text',required:true},{key:'date',label:'Data',type:'date',required:true},{key:'location',label:'Local',type:'text',required:false}] as const).map(f=><label className={f.key==='name'||f.key==='location'?'full':''} key={f.key}>{f.label}{!f.required&&<span className="optional">opcional</span>}<input name={f.key} type={f.type} required={f.required} value={draft[f.key]} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key]?`race-${f.key}-error`:undefined} onChange={e=>{setDraft(d=>({...d,[f.key]:e.target.value}));setErrors(err=>({...err,[f.key]:''}));}}/>{errors[f.key]&&<span id={`race-${f.key}-error`} className="field-error" role="alert">{errors[f.key]}</span>}</label>)}
    <label className="full">Distâncias<input name="distances" required value={distanceText} placeholder="Ex.: 3 km, 5 km, 10 km" aria-invalid={!!errors.distances} aria-describedby="race-distances-help race-distances-error" onChange={e=>{setDistanceText(e.target.value);setErrors({});}}/><span className="form-note" id="race-distances-help">Separe as distâncias por vírgula.</span>{errors.distances&&<span id="race-distances-error" className="field-error" role="alert">{errors.distances}</span>}</label>
    <fieldset className="participants full"><legend>Participantes</legend><p className="form-note">Selecione um aluno e a distância em que participará.</p><div className="participant-options">{people.map(person=>{const participant=draft.participants.find(p=>p.studentId===person.id);const field=`distance-${person.id}`;return <div className="participant-option" key={person.id}><label><input type="checkbox" name="participantIds" value={person.id} checked={!!participant} onChange={e=>setDraft(d=>({...d,participants:e.target.checked?[...d.participants,{studentId:person.id,distance:distances.length===1?distances[0]:''}]:d.participants.filter(p=>p.studentId!==person.id)}))}/><span>{person.name}<small>{person.status}</small></span></label>{participant&&<label className="participant-distance">Distância de {person.name}<select name={field} required value={distances.includes(participant.distance)?participant.distance:''} aria-invalid={!!errors[field]} onChange={e=>{const distance=e.target.value;setDraft(d=>({...d,participants:d.participants.map(p=>p.studentId===person.id?{...p,distance}:p)}));setErrors(err=>({...err,[field]:''}));}}><option value="">Selecione a distância</option>{distances.map(distance=><option key={distance}>{distance}</option>)}</select>{errors[field]&&<span className="field-error" role="alert">{errors[field]}</span>}</label>}</div>;})}</div></fieldset>
    </div><div className="sheet-actions"><button type="button" className="quiet-button" onClick={onClose}>Cancelar</button><button className="primary"><Check size={18}/> Salvar prova</button></div></form></Modal>;
}
