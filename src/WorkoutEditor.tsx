import {useState, type FormEvent} from 'react';
import {Check} from 'lucide-react';
import Modal from './Modal';
import {summary, type Workout} from './data';
export default function WorkoutEditor({initial, subtitle, editing, onClose, onSave}: {initial: Workout; subtitle: string; editing: boolean; onClose: () => void; onSave: (w: Workout) => void}) {
  const [workout, setWorkout] = useState(initial);
  const update = (key: keyof Workout, value: string | number) => setWorkout(w => ({...w, [key]: value}));
  const numeric = (key: keyof Workout, label: string, min = 0, step = 1) => <label key={key}>{label}<input type="number" inputMode="decimal" required min={min} step={step} value={String(workout[key])} onChange={e => update(key, Number(e.target.value))}/></label>;
  const submit = (e: FormEvent) => {e.preventDefault(); if (workout.title.trim()) onSave({...workout, title:workout.title.trim()});};
  return <Modal title={editing ? 'Editar treino' : 'Criar treino'} subtitle={subtitle} onClose={onClose}>
    <form onSubmit={submit}>
      <div className="form-fields">
        <label className="full">Nome<input autoFocus required value={workout.title} onChange={e => update('title', e.target.value)}/></label>
        <label className="full">Tipo de treino<select value={workout.type} onChange={e => setWorkout({...workout, type:e.target.value, distance:e.target.value === 'Rodagem' ? 5 : 200})}><option>Rodagem</option><option>Tiros</option><option>Intervalado por tempo</option></select></label>
        {workout.type === 'Rodagem' ? <>{numeric('distance', 'Distância (km)', 0.1, 0.1)}<label>Pace (min/km)<input required inputMode="text" pattern="[0-9]{1,2}:[0-5][0-9]" placeholder="6:30" value={workout.pace} onChange={e => update('pace', e.target.value)}/></label></> : <>
          {numeric('reps', 'Repetições', 1)}
          {workout.type === 'Tiros' ? <>{numeric('distance', 'Distância por tiro (m)', 1)}<label>Tempo alvo por tiro<input required placeholder="50 s" value={workout.target} onChange={e => update('target', e.target.value)}/></label></> : numeric('duration', 'Tempo de esforço (min)', 0.1, 0.1)}
          {numeric('rest', 'Tempo de pausa (min)', 0, 0.1)}
        </>}
        {numeric('warmup', 'Aquecimento (min)', 0, 0.1)}{numeric('cooldown', 'Desaquecimento (min)', 0, 0.1)}
        <label className="full">Orientações <span className="optional">opcional</span><textarea value={workout.notes} placeholder="O que o aluno precisa saber?" onChange={e => update('notes', e.target.value)}/></label>
      </div>
      <div className="workout-preview" aria-live="polite"><span>Assim fica o treino</span><strong>{summary(workout)}</strong>{workout.type === 'Tiros' && <p>Pausa de {workout.rest} min entre tiros</p>}<p>{workout.warmup} min de aquecimento · {workout.cooldown} min de desaquecimento</p>{workout.notes && <p>{workout.notes}</p>}</div>
      <div className="sheet-actions"><button type="button" className="quiet-button" onClick={onClose}>Cancelar</button><button className="primary"><Check size={19}/> Salvar treino</button></div>
    </form>
  </Modal>;
}
