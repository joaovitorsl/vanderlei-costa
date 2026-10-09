import {useState, useRef, type FormEvent} from 'react';
import {ArrowLeft, ArrowRight, Check} from 'lucide-react';
import Modal from './Modal';
import {type Student} from './data';
type Field = [keyof Student, string];
const steps: Field[][] = [
  [['name','Nome completo'],['birth','Data de nascimento'],['shirt','Camisa'],['gender','Gênero'],['cpf','CPF fictício'],['phone','Telefone fictício'],['email','E-mail fictício'],['street','Rua'],['number','Número'],['neighborhood','Bairro'],['city','Cidade'],['state','Estado'],['enrollment','Matrícula / ano']],
  [['level','Nível'],['goal','Objetivo'],['pace','Pace atual'],['frequency','Dias por semana'],['experience','Tempo de corrida'],['availability','Disponibilidade'],['race','Próxima prova'],['raceDate','Data da prova'],['raceDistance','Distância da prova']],
  [['plan','Modalidade / plano'],['value','Mensalidade (R$)'],['due','Dia do vencimento'],['status','Status'],['medical','Restrições médicas'],['notes','Observações comuns']]
];
const options: Partial<Record<keyof Student, string[]>> = {shirt:['PP','P','M','G','GG'], gender:['Feminino','Masculino','Outro','Prefere não informar'],level:['Iniciante','Intermediário','Avançado'],status:['Ativo','Pausado'],plan:['Corrida','Musculação','Outros']};
export default function StudentForm({initial, editing, initialStep = 0, onClose, onSave}: {initial: Student; editing: boolean; initialStep?: number; onClose: () => void; onSave: (s: Student) => void}) {
  const [student, setStudent] = useState(initial), [step, setStep] = useState(initialStep), [error, setError] = useState('');
  const form = useRef<HTMLFormElement>(null);
  function move(next: number) {if (next > step && !form.current?.reportValidity()) return; setError(''); setStep(next); form.current?.closest('.sheet')?.scrollTo({top:0});}
  function submit(e: FormEvent) {
    e.preventDefault();
    if (step < 2) {move(step + 1); return;}
    if (!student.name.trim() || !student.birth) {setStep(0);setError('Preencha nome e data de nascimento.');return;}
    onSave({...student, name:student.name.trim()});
  }
  return <Modal title={editing ? 'Editar aluno' : 'Novo aluno'} subtitle={`Etapa ${step + 1} de 3`} onClose={onClose}>
    <div className="form-steps" aria-label="Etapas do cadastro">{['Pessoal','Corrida','Plano e saúde'].map((label, i) => <button type="button" key={label} aria-current={step === i ? 'step' : undefined} className={step === i ? 'selected' : ''} onClick={() => move(i)}><span>{i + 1}</span>{label}</button>)}</div>
    <form ref={form} onSubmit={submit}>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-fields">{steps[step].map(([key, label]) => <label className={['name','medical','notes','availability'].includes(key) ? 'full' : ''} key={key}>{label}
      {options[key] ? <select value={String(student[key])} onChange={e => setStudent({...student, [key]:e.target.value})}>{options[key]!.map(v => <option key={v}>{v}</option>)}</select>
      : ['medical','notes'].includes(key) ? <textarea value={String(student[key])} onChange={e => setStudent({...student, [key]:e.target.value})}/>
      : <input required={['name','birth'].includes(key)} type={['birth','raceDate'].includes(key) ? 'date' : ['value','due','frequency'].includes(key) ? 'number' : key === 'email' ? 'email' : 'text'} inputMode={['value','due','frequency'].includes(key) ? 'decimal' : undefined} min={key === 'value' ? 0 : 1} max={key === 'due' ? 31 : key === 'frequency' ? 7 : key === 'birth' ? '2026-10-08' : undefined} step={key === 'value' ? 0.01 : undefined} value={String(student[key])} onChange={e => setStudent({...student, [key]:['value','due','frequency'].includes(key) ? Number(e.target.value) : e.target.value})}/>}
    </label>)}</div><p className="form-note">Demonstração: use apenas dados fictícios.</p><div className="sheet-actions">{step > 0 ? <button type="button" className="quiet-button" onClick={() => move(step - 1)}><ArrowLeft size={18}/> Voltar</button> : <button type="button" className="quiet-button" onClick={onClose}>Cancelar</button>}<button className="primary">{step < 2 ? <>Continuar <ArrowRight size={18}/></> : <>Salvar aluno <Check size={18}/></>}</button></div></form>
  </Modal>;
}
