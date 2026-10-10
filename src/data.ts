export const commercialPlans = {
  Lite: {value:80, months:1, benefits:['Treinos às terças, quintas e domingos.']},
  Fire: {value:420, months:6, benefits:['Pagamento via PIX.', 'Uniforme incluso.']},
  Família: {value:150, months:1, benefits:['Para mais de uma pessoa da mesma família.', 'Avaliação física com peso, medidas e bioimpedância inclusa.']}
} as const;
export type PlanName = keyof typeof commercialPlans;
export type Student = {
  id: string; name: string; birth: string; shirt: string; gender: string;
  cpf: string; phone: string; email: string; street: string; number: string;
  neighborhood: string; city: string; state: string; enrollment: string;
  modality: string; plan: PlanName; renewalDate: string;
  uniformStatus?: 'Não se aplica' | 'Pendente' | 'Entregue';
  value: number; due: number; status: string; level: string;
  goal: string; pace: string; frequency: number; experience: string;
  availability: string;
  medical: string; notes: string;
};
export type Workout = {
  duplicatedFromWeek?: number;
  titleCustomized?: boolean;
  id: string; type: string; title: string; warmup: number; reps: number;
  distance: number; target: string; rest: number; cooldown: number;
  pace: string; duration: number; notes: string;
};
export type Schedule = Record<string, Workout[]>;
export const today = new Date(2026, 9, 8, 12);
export const days = [1, 3, 6] as const; // Offsets from Monday: Tuesday, Thursday, Sunday.
export const dayNames: Record<number, string> = {1: 'Terça', 3: 'Quinta', 6: 'Domingo'};
export const weekDate = (week: number, day: number) => new Date(2026, 9, 5 + week * 7 + day, 12);
export const shortDate = (date: Date) => date.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}).replace(' de ', ' ').replace('.', '');
export const dateLabel = (date: string) => date && Number.isFinite(new Date(date + 'T12:00:00').getTime()) ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Não informada';
export const money = (n: number) => Number.isFinite(n) ? n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : 'Não informado';
export const initials = (name: string) => name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('');
export const scheduleKey = (id: string, week: number, day: number) => `${id}:${week}:${day}`;
export const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const names = ['Marina Almeida','Rafael Oliveira','Beatriz Santos','Lucas Ferreira','Camila Rodrigues','Pedro Martins','Juliana Costa','André Lima','Fernanda Rocha','Gustavo Ribeiro','Letícia Barros','Bruno Mendes'];
export const students: Student[] = names.map((name, i) => ({
  id: String(i + 1), name,
  birth: `${1987 + i % 12}-${i < 3 ? '10' : String(i + 1).padStart(2, '0')}-${String(i === 0 ? 8 : i < 3 ? 10 + i * 4 : 8 + i).padStart(2, '0')}`,
  shirt: ['M','G','P'][i % 3], gender: i % 2 ? 'Masculino' : 'Feminino',
  cpf: '000.000.000-00', phone: '(00) 00000-0000', email: `aluno${i + 1}@example.com`,
  street: 'Rua Exemplo', number: String(100 + i), neighborhood: 'Bairro Modelo', city: 'Cidade Exemplo', state: 'CE',
  enrollment: `2026-${String(i + 1).padStart(3, '0')}`,
  modality:'Corrida de rua', plan: (['Lite','Fire','Família'] as const)[i % 3], value:[80,420,150][i % 3],
  renewalDate:`2026-10-${String([10,10,12,20,20,25,25,20,25,20,25,25][i]).padStart(2,'0')}`,
  due: [10,10,12,20,20,25,25,20,25,20,25,25][i], status: i === 11 ? 'Pausado' : 'Ativo',
  level: ['Intermediário','Avançado','Iniciante'][i % 3], goal: ['10 km','21 km','5 km'][i % 3],
  pace: ['5:45','4:50','6:30'][i % 3], frequency: 3, experience: ['2 anos','4 anos','6 meses'][i % 3],
  availability: 'Domingo, terça e quinta · manhã',
  medical: i === 0 ? 'Histórico de desconforto no joelho direito. Observar relato de dor.' : '',
  notes: 'Prefere treinar pela manhã.'
}));
const base = {warmup: 5, reps: 6, distance: 200, target: '50 s', rest: 1, cooldown: 5, pace: '6:00', duration: 2, notes: ''};
export const templates: Workout[] = [
  {...base, id:'t1', type:'Rodagem', title:'Rodagem leve', distance:5, pace:'6:30'},
  {...base, id:'t2', type:'Rodagem', title:'Rodagem longa', distance:10},
  {...base, id:'t3', type:'Tiros', title:'Tiros 200 m'},
  {...base, id:'t4', type:'Tiros', title:'Tiros 400 m', distance:400, target:'1 min 50 s'},
  {...base, id:'t5', type:'Tiros', title:'Tiros 800 m', distance:800, reps:4, target:'4 min'},
  {...base, id:'t6', type:'Intervalado por tempo', title:'Intervalado por tempo', reps:8, duration:2}
];
export const initialSchedule: Schedule = {};
for (const student of students.filter(s => s.modality === 'Corrida de rua' && s.status === 'Ativo')) {
  for (let week = -1; week <= 1; week++) {
    for (const day of days) {
      if (week === 0 && day === 3 && Number(student.id) > 4) continue;
      if (week === 1 && (Number(student.id) > 8 || day === 3)) continue;
      initialSchedule[scheduleKey(student.id, week, day)] = [{...templates[day === 6 ? 1 : day === 3 ? 2 : 0], id:`${student.id}-${week}-${day}`}];
    }
  }
}
export const planPrice = (student: Pick<Student, 'plan' | 'value'>) => `${money(student.value)} / ${commercialPlans[student.plan].months === 6 ? '6 meses' : 'mês'}`;
export const renewalLabel = (student: Pick<Student, 'plan' | 'due' | 'renewalDate'>) => student.plan === 'Fire'
  ? (student.renewalDate && Number.isFinite(new Date(student.renewalDate+'T12:00:00').getTime()) ? shortDate(new Date(student.renewalDate+'T12:00:00')) : 'Não informada')
  : (student.due ? `Dia ${student.due}` : 'Não informado');
export const dueDayThisMonth = (student: Pick<Student, 'plan' | 'due' | 'renewalDate'>) => student.plan === 'Fire'
  ? (student.renewalDate?.startsWith('2026-10-') ? Number(student.renewalDate.slice(8,10)) : 0) : student.due;

// Adapt previous demo records without resetting names, notes, workouts or custom data.
export function normalizeStudent(student: Student): Student {
  const knownPlan = Object.hasOwn(commercialPlans, student.plan);
  const plan = knownPlan ? student.plan : students.find(seed => seed.id === student.id)?.plan || 'Lite';
  const {race, raceDate, raceDistance, ...profile} = student as Student & {race?:string;raceDate?:string;raceDistance?:string};
  return {...profile, modality:student.modality || 'Corrida de rua', plan,
    value:knownPlan ? student.value : commercialPlans[plan].value,
    renewalDate:student.renewalDate ?? (student.due ? `2026-10-${String(student.due).padStart(2,'0')}` : '')};
}
export const summary = (w: Workout) => w.type === 'Rodagem'
  ? `${w.distance} km · ${w.pace}/km`
  : w.type === 'Tiros' ? `${w.reps} × ${w.distance} m · ${w.target}`
  : `${w.reps} × ${w.duration} min · pausa ${w.rest} min`;
export const assessments = [
  {date: '2026-10-02', type: '2400 m', distance: '2400 m', time: '10:42', vo2: '59,1', hr: '185'},
  {date: '2026-07-10', type: '1600 m', distance: '1600 m', time: '07:20', vo2: '57,2', hr: '186'},
  {date: '2026-05-03', type: 'Outro', distance: '2000 m', time: '09:15', vo2: '55,0', hr: '184'}
];
export function emptyStudent(count: number): Student {
  return {...students[0], id: crypto.randomUUID(), name:'', birth:'', email:'', street:'', number:'', neighborhood:'', city:'', state:'',
    enrollment:`2026-${String(count + 1).padStart(3, '0')}`, modality:'Corrida de rua', plan:'Lite', value:80, renewalDate:'', due:10, status:'Ativo',
    medical:'', notes:''};
}
