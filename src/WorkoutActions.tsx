import {Copy, Pencil, Trash2, ChevronRight} from 'lucide-react';
import type {Workout} from './data';

type Props = {workout: Workout; onEdit: () => void; onDuplicate: () => void; onDelete: () => void};
export default function WorkoutActions({workout, onEdit, onDuplicate, onDelete}: Props) {
  return <div className="row-group sheet-choices" aria-label={`Ações de ${workout.title}`}>
    <button className="action-row" onClick={onEdit}><span className="row-icon"><Pencil size={20}/></span><span className="row-text"><strong>Editar treino</strong></span><ChevronRight className="chevron" size={19}/></button>
    <button className="action-row" onClick={onDuplicate}><span className="row-icon"><Copy size={20}/></span><span className="row-text"><strong>Duplicar treino</strong><small>Criar uma cópia no mesmo dia</small></span><ChevronRight className="chevron" size={19}/></button>
    <button className="action-row danger-text" onClick={onDelete}><span className="row-icon"><Trash2 size={20}/></span><span className="row-text"><strong>Excluir treino</strong></span><ChevronRight className="chevron" size={19}/></button>
  </div>;
}
