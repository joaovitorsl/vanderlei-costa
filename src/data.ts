export type Student = {
  id: string; name: string; birth: string; shirt: string; gender: string;
  cpf: string; phone: string; email: string; street: string; number: string;
  neighborhood: string; city: string; state: string; enrollment: string;
  plan: string; value: number; due: number; status: string; level: string;
  goal: string; pace: string; frequency: number; experience: string;
  availability: string; race: string; raceDate: string; raceDistance: string;
  medical: string; notes: string;
};
export type Workout = {
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
export const dateLabel = (date: string) => date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Não informada';
export const money = (n: number) => n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
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
  plan: i === 9 ? 'Musculação' : i === 11 ? 'Outros' : 'Corrida', value: [80,80,60][i % 3],
  due: [10,10,12,20,20,25,25,20,25,20,25,25][i], status: i === 11 ? 'Pausado' : 'Ativo',
  level: ['Intermediário','Avançado','Iniciante'][i % 3], goal: ['10 km','21 km','5 km'][i % 3],
  pace: ['5:45','4:50','6:30'][i % 3], frequency: 3, experience: ['2 anos','4 anos','6 meses'][i % 3],
  availability: 'Domingo, terça e quinta · manhã',
  race: i === 9 || i === 11 ? '' : i % 2 ? 'Meia da Primavera' : 'Circuito Parque Verde',
  raceDate: i === 9 || i === 11 ? '' : i % 2 ? '2026-11-08' : '2026-10-25',
  raceDistance: i === 9 || i === 11 ? '' : i % 2 ? '21 km' : '10 km',
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
for (const student of students.filter(s => s.plan === 'Corrida' && s.status === 'Ativo')) {
  for (let week = -1; week <= 1; week++) {
    for (const day of days) {
      if (week === 0 && day === 3 && Number(student.id) > 4) continue;
      if (week === 1 && (Number(student.id) > 8 || day === 3)) continue;
      initialSchedule[scheduleKey(student.id, week, day)] = [{...templates[day === 6 ? 1 : day === 3 ? 2 : 0], id:`${student.id}-${week}-${day}`}];
    }
  }
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
    enrollment:`2026-${String(count + 1).padStart(3, '0')}`, plan:'Corrida', value:80, due:10, status:'Ativo',
    race:'', raceDate:'', raceDistance:'', medical:'', notes:''};
}
