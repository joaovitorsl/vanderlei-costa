import {useState, useRef, useLayoutEffect, type FormEvent} from 'react';
import {ArrowLeft, ArrowRight, Check} from 'lucide-react';
import Modal from './Modal';
import {commercialPlans, type PlanName, type Student} from './data';
import {fieldError, formErrors} from './formValidation';
type StudentDraft = Omit<Student, 'value' | 'due' | 'frequency'> & {value:number|'';due:number|'';frequency:number|''};
type Field = [keyof Student, string];
const steps: Field[][] = [
  [['name','Nome completo'],['birth','Data de nascimento'],['shirt','Camisa'],['gender','Gênero'],['cpf','CPF fictício'],['phone','Telefone fictício'],['email','E-mail fictício'],['street','Rua'],['number','Número'],['neighborhood','Bairro'],['city','Cidade'],['state','Estado'],['enrollment','Matrícula / ano']],
  [['modality','Modalidade'],['level','Nível'],['goal','Objetivo'],['pace','Pace atual'],['frequency','Dias por semana'],['experience','Tempo de corrida'],['availability','Disponibilidade']],
  [['plan','Plano comercial'],['value','Mensalidade (R$)'],['due','Dia do vencimento'],['status','Status'],['medical','Restrições médicas'],['notes','Observações comuns']]
];
const options: Partial<Record<keyof Student, string[]>> = {shirt:['PP','P','M','G','GG'], gender:['Feminino','Masculino','Outro','Prefere não informar'],level:['Iniciante','Intermediário','Avançado'],status:['Ativo','Pausado'],modality:['Corrida de rua'],goal:['3 km','5 km','10 km','21 km','42 km','Outro'],plan:Object.keys(commercialPlans)};
export default function StudentForm({initial, editing, initialStep = 0, onClose, onSave}: {initial: Student; editing: boolean; initialStep?: number; onClose: () => void; onSave: (s: Student) => void}) {
  const [student, setStudent] = useState<StudentDraft>({...initial,due:initial.due || '',frequency:initial.frequency || ''}), [step, setStep] = useState(initialStep), [errors, setErrors] = useState<Record<string, string>>({});
  const form = useRef<HTMLFormElement>(null);
  const focusAfterStep = useRef(false);
  useLayoutEffect(() => {
    if (!focusAfterStep.current) return;
    focusAfterStep.current = false;
    form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
  function validate() {const nextErrors = form.current ? formErrors(form.current) : {}; setErrors(nextErrors); return !Object.keys(nextErrors).length;}
  function update(key: keyof Student, input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    const value = ['value','due','frequency'].includes(key) && input.value !== '' ? Number(input.value) : input.value;
    setStudent(current => ({...current, [key]:value, ...(key === 'plan' ? {value:commercialPlans[value as PlanName].value} : {})}));
    if (errors[key]) setErrors(current => ({...current, [key]:fieldError(input)}));
  }
  function move(next: number) {if (next > step && !validate()) return; setErrors({}); setStep(next); form.current?.closest('.sheet')?.scrollTo({top:0}); form.current?.closest('.overlay')?.scrollTo({top:0});}
  function submit(e: FormEvent) {
    e.preventDefault();
    if (step < 2) {move(step + 1); return;}
    if (!validate()) return;
    if (!student.name.trim() || !student.birth) {focusAfterStep.current = true;setStep(0);setErrors({...(!student.name.trim() ? {name:'Este campo é obrigatório.'} : {}), ...(!student.birth ? {birth:'Este campo é obrigatório.'} : {})});return;}
    onSave({...student, name:student.name.trim(),value:Number(student.value),due:Number(student.due),frequency:Number(student.frequency)});
  }
  return <Modal fullScreenOnMobile title={editing ? 'Editar aluno' : 'Novo aluno'} subtitle={`Etapa ${step + 1} de 3`} onClose={onClose}>
    <div className="form-steps" aria-label="Etapas do cadastro">{['Pessoal','Corrida','Plano e saúde'].map((label, i) => <button type="button" key={label} aria-current={step === i ? 'step' : undefined} className={step === i ? 'selected' : ''} onClick={() => move(i)}><span>{i + 1}</span>{label}</button>)}</div>
    <h3 className="current-form-step">{['Pessoal','Corrida','Plano e saúde'][step]}</h3><form ref={form} noValidate onSubmit={submit}><div className="form-fields">{steps[step].map(([fieldKey, fieldLabel]) => {
      const key = fieldKey === 'due' && student.plan === 'Fire' ? 'renewalDate' : fieldKey;
      const label = key === 'renewalDate' ? 'Renovação' : key === 'value' && student.plan === 'Fire' ? 'Valor por 6 meses (R$)' : fieldLabel;
      return <label className={`${['name','medical','notes','availability'].includes(key) ? 'full' : ''} ${key === 'medical' ? 'medical-field' : ''}`} key={key}>{label}
      {options[key] ? <select name={key} value={String(student[key] ?? '')} onChange={e => update(key, e.currentTarget)}>{!options[key]!.includes(String(student[key] ?? '')) && <option value={String(student[key] ?? '')}>{String(student[key] ?? '') || 'Não informado'}</option>}{options[key]!.map(v => <option key={v}>{v}</option>)}</select>
      : ['medical','notes'].includes(key) ? <textarea name={key} value={String(student[key] ?? '')} onChange={e => update(key, e.currentTarget)}/>
      : <input name={key} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `student-${key}-error` : undefined} required={['name','birth'].includes(key)} type={['birth','renewalDate'].includes(key) ? 'date' : ['value','due','frequency'].includes(key) ? 'number' : key === 'email' ? 'email' : 'text'} inputMode={['value','due','frequency'].includes(key) ? 'decimal' : undefined} min={key === 'value' ? 0 : 1} max={key === 'due' ? 31 : key === 'frequency' ? 7 : key === 'birth' ? '2026-10-08' : undefined} step={key === 'value' ? 0.01 : undefined} value={String(student[key] ?? '')} onChange={e => update(key, e.currentTarget)}/>}
      {errors[key] && <span id={`student-${key}-error`} className="field-error" role="alert">{errors[key]}</span>}
    </label>;})}</div>{step === 2 && <p className="form-note">{student.plan === 'Fire' ? 'Fire: 6 meses via PIX, com uniforme incluso.' : commercialPlans[student.plan].benefits.join(' ')}</p>}<p className="form-note">Demonstração: use apenas dados fictícios.</p><div className="sheet-actions">{step > 0 ? <button type="button" className="quiet-button" onClick={() => move(step - 1)}><ArrowLeft size={18}/> Voltar</button> : <button type="button" className="quiet-button" onClick={onClose}>Cancelar</button>}<button className="primary">{step < 2 ? <>Continuar <ArrowRight size={18}/></> : <>Salvar aluno <Check size={18}/></>}</button></div></form>
  </Modal>;
}
