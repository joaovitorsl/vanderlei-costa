import {useState, type FormEvent} from 'react';
import {Check} from 'lucide-react';
import Modal from './Modal';
import {type Workout} from './data';
import {fieldError, formErrors} from './formValidation';

import {cleanWorkout, changeWorkoutType, type Draft, type NumberField} from './workoutState';
type Field = {key: NumberField; label: string; min: number; step: number} | {key: 'pace' | 'target'; label: string; placeholder: string};
const typeFields: Record<string, Field[]> = {
  Rodagem: [{key:'distance', label:'Distância (km)', min:0.1, step:0.1}, {key:'pace', label:'Pace (min/km)', placeholder:'6:30'}],
  Tiros: [{key:'reps', label:'Repetições', min:1, step:1}, {key:'distance', label:'Distância por tiro (m)', min:1, step:1}, {key:'target', label:'Tempo alvo por tiro', placeholder:'50 s'}, {key:'rest', label:'Tempo de pausa (min)', min:0, step:0.1}],
  'Intervalado por tempo': [{key:'reps', label:'Repetições', min:1, step:1}, {key:'duration', label:'Tempo de esforço (min)', min:0.1, step:0.1}, {key:'rest', label:'Tempo de pausa (min)', min:0, step:0.1}]
};
const commonFields: Field[] = [{key:'warmup', label:'Aquecimento (min)', min:0, step:0.1}, {key:'cooldown', label:'Desaquecimento (min)', min:0, step:0.1}];
export default function WorkoutEditor({initial, subtitle, editing, onClose, onSave}: {initial: Workout; subtitle: string; editing: boolean; onClose: () => void; onSave: (w: Workout) => void}) {
  const [workout, setWorkout] = useState<Draft>(() => cleanWorkout({...initial}));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const change = (input: HTMLInputElement | HTMLTextAreaElement) => {
    const {name, value, type} = input;
    setWorkout(current => ({...current, [name]:type === 'number' && value !== '' ? Number(value) : value}));
    if (errors[name]) setErrors(current => ({...current, [name]:fieldError(input)}));
  };
  const error = (key: string) => errors[key] && <span id={`workout-${key}-error`} className="field-error" role="alert">{errors[key]}</span>;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = formErrors(e.currentTarget);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(cleanWorkout({...workout, title:workout.title.trim(), distance:Number(workout.distance), reps:Number(workout.reps), duration:Number(workout.duration), rest:Number(workout.rest), warmup:Number(workout.warmup), cooldown:Number(workout.cooldown)}));
  };
  return <Modal stickyFooter fullScreenOnMobile title={editing ? 'Editar treino' : 'Criar treino'} subtitle={subtitle} onClose={onClose}>
    <form noValidate onSubmit={submit}>
      <div className="form-fields">
        <label className="full">Nome<input name="title" required value={workout.title} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'workout-title-error' : undefined} onChange={e => change(e.currentTarget)}/>{error('title')}</label>
        <label className="full">Tipo de treino<select value={workout.type} onChange={e => {
          const type = e.currentTarget.value;
          setWorkout(current => changeWorkoutType(current, type));
          setErrors({});
        }}>{Object.keys(typeFields).map(type => <option key={type}>{type}</option>)}</select></label>
        {/* Type is part of each key: incompatible controls cannot retain a previous type's DOM state. */}
        {[...(typeFields[workout.type] || []), ...commonFields].map(field => <label key={`${workout.type}-${field.key}`}>{field.label}<input name={field.key} required type={'min' in field ? 'number' : 'text'} inputMode={'min' in field ? 'decimal' : 'text'} min={'min' in field ? field.min : undefined} step={'step' in field ? field.step : undefined} pattern={field.key === 'pace' ? '[0-9]{1,2}:[0-5][0-9]' : undefined} placeholder={'placeholder' in field ? field.placeholder : undefined} value={workout[field.key]} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `workout-${field.key}-error` : undefined} onChange={e => change(e.currentTarget)}/>{error(field.key)}</label>)}
        <label className="full">Orientações <span className="optional">opcional</span><textarea name="notes" value={workout.notes} placeholder="O que o aluno precisa saber?" onChange={e => change(e.currentTarget)}/></label>
      </div>
      <div className="workout-preview" aria-live="polite">
        <span>Assim fica o treino</span>
        <strong>{workout.type === 'Rodagem' ? `${workout.distance || '—'} km · ${workout.pace || '—'}/km` : workout.type === 'Tiros' ? `${workout.reps || '—'} × ${workout.distance || '—'} m` : `${workout.reps || '—'} × ${workout.duration || '—'} min`}</strong>
        {workout.type === 'Tiros' && <p>{workout.target || '—'} por tiro</p>}
        {workout.type !== 'Rodagem' && <p>Pausa {workout.rest === '' ? '—' : workout.rest} min</p>}
        <p>{workout.warmup === '' ? '—' : workout.warmup} min aquecimento</p><p>{workout.cooldown === '' ? '—' : workout.cooldown} min desaquecimento</p>
        {workout.notes && <p>{workout.notes}</p>}
      </div>
      <div className="sheet-actions"><button type="button" className="quiet-button" onClick={onClose}>Cancelar</button><button className="primary"><Check size={19}/> Salvar treino</button></div>
    </form>
  </Modal>;
}
