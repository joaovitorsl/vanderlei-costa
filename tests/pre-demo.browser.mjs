import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:5177/vanderlei-costa/';
export function scenario(tab,browser,width,outputDir) {
 const p=tab.playwright, b=name=>p.getByRole('button',{name,exact:typeof name==='string'});
 const snap=()=>p.domSnapshot();
 const has=async text=>assert.ok((await snap()).includes(text),`Missing: ${text}`);
 const absent=async text=>assert.ok(!(await snap()).includes(text),`Unexpected: ${text}`);
 const nav=async name=>{await p.getByRole('navigation',{name:width<1000?'Navegação no celular':'Navegação principal'}).getByRole('button',{name,exact:true}).click();await snap();};
 const fill=async(name,value)=>{const input=p.locator(`input[name="${name}"]`);await input.fill(value);const type=await input.getAttribute('type');if(type==='date'||type==='time'){await input.press('ArrowUp');await input.press('ArrowDown');}};
 const select=async(name,value)=>p.locator(`select[name="${name}"]`).selectOption(value);
 const close=()=>b(width<600?'Voltar sem salvar':'Fechar').click();
 const area=async name=>{if(width>=1000){await nav(name);}else{await nav('Mais');await b(new RegExp(`^${name}`)).click();}await snap();};
 const shot=async name=>{const dim=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,dialogs:[...document.querySelectorAll('[role=dialog]')].map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))}));assert.ok(dim.scroll<=dim.width,JSON.stringify(dim));for(const d of dim.dialogs)assert.ok(d.left>=0&&d.right<=dim.width+1,JSON.stringify(d));await mkdir(outputDir,{recursive:true});await writeFile(`${outputDir}/${width}-${name}.jpg`,await tab.getScreenshot({emit:false}));};
 const qaName=`Aluno QA ${width}`;
 const profile=async(name=qaName)=>{await nav('Alunos');await b(new RegExp(name)).click();await snap();};
 return {
  async start(){await (await browser.capabilities.get('viewport')).set({width,height:width<1000?844:900});await tab.goto(base+'?resetDemo=1');await has('Bom dia');await shot('inicio');},
  async students(){
   await nav('Alunos');await b('Novo aluno').click();assert.equal(await p.locator('input[name="enrollment"]').count(),0);await absent('Será gerada ao salvar');await absent('CPF fictício');await absent('Telefone fictício');await absent('E-mail fictício');
   await fill('name',qaName);await fill('birth','1993-06-15');await b('Continuar').click();await select('goal','Outro');await has('Qual objetivo?');await fill('customGoal','Completar minha primeira prova');await select('goal','10 km');assert.equal(await p.locator('input[name="customGoal"]').count(),0);await select('goal','Outro');await fill('customGoal','Correr 30 minutos');await fill('runningSince','2022');await shot('aluno-objetivo-personalizado');await b('Continuar').click();await b('Salvar aluno').click();await has(qaName);
   await profile();await has('Correr 30 minutos');await b('Dados cadastrais').click();await has('2026-013');await has('Início na corrida');await has('2022');await b('Editar').click();assert.equal(await p.locator('input[name="enrollment"]').getAttribute('readonly'),'');await b('Continuar').click();await select('goal','21 km');assert.equal(await p.locator('input[name="customGoal"]').count(),0);await fill('runningSince','2021');await b('Continuar').click();await b('Salvar aluno').click();await has('2026-013');await has('2021');await has('21 km');
   await tab.reload();await profile();await b('Dados cadastrais').click();await has('2026-013');await has('2021');await shot('aluno-dados');
   return {width,students:'passed'};
  },
  async assessments(){
   await profile();await b('Avaliações').click();await has('Nenhuma avaliação registrada.');await b('Nova avaliação').click();await b('Salvar avaliação').click();await has('Este campo é obrigatório.');await select('type','Outro');await fill('time','9:80');await b('Salvar avaliação').click();await has('Use o formato min:seg');await has('Nome da avaliação');await fill('name','Teste QA');await fill('time','09:20');await fill('hr','185');await p.locator('textarea[name="notes"]').fill('Registro ilustrativo');await shot('nova-avaliacao');await b('Salvar avaliação').click();await has('Teste QA');await has('09:20');await has('185 bpm');await has('Registro ilustrativo');
   await tab.reload();await profile();await b('Avaliações').click();await has('Teste QA');await b('Editar avaliação').click();await select('type','2400 m');assert.equal(await p.locator('input[name="name"]').count(),0);await fill('time','10:00');await b('Salvar avaliação').click();await has('2400 m');await has('10:00');await absent('Teste QA');await shot('avaliacao-salva');
   await b('Excluir avaliação').click();await b('Cancelar').click();await has('2400 m');await b('Excluir avaliação').click();await p.getByRole('dialog').getByRole('button',{name:'Excluir avaliação',exact:true}).click();await has('Nenhuma avaliação registrada.');
   await b('Nova avaliação').click();await fill('time','07:30');await b('Salvar avaliação').click();await has('1600 m');await absent('FC máxima');
   await profile('Rafael Oliveira');await b('Avaliações').click();assert.equal(await p.locator('.assessment-list details').count(),3);await absent('07:30');
   return {width,assessments:'passed'};
  },
  async agenda(){
   await area('Agenda coletiva');await has('Longão coletivo');await b('Adicionar encontro').click();await select('kind','event');await fill('date','2026-10-09');await fill('time','19:00');await fill('location','Salão da assessoria');await fill('title','Confraternização QA');await shot('agenda-evento');await b('Salvar registro').click();await has('Confraternização QA');await has('Evento / confraternização');
   await b('Editar 19:00 · Confraternização QA').click();await select('kind','long-run');await b('Salvar registro').click();await has('Confraternização QA');
   await b('Adicionar encontro').click();await select('kind','free-day');assert.equal(await p.locator('input[name="time"]').count(),0);assert.equal(await p.locator('input[name="location"]').count(),0);await has('Não há encontro coletivo neste dia.');await fill('date','2026-10-09');await b('Salvar dia livre').click();await has('Este dia já tem');await fill('date','2026-10-10');await shot('agenda-dia-livre');await b('Salvar dia livre').click();await has('Dia livre');await has('Não há encontro coletivo neste dia.');
   await tab.reload();await area('Agenda coletiva');await has('Confraternização QA');await has('Dia livre');await shot('agenda-salva');
   return {width,agenda:'passed'};
  },
  async races(){
   await area('Próximas provas');await p.getByText('Circuito Parque Verde',{exact:true}).click();await has('3 km / 5 km / 10 km');await shot('prova-multiplas-distancias');await b('Nova prova').click();await b('Salvar prova').click();await has('Este campo é obrigatório.');await fill('name','Prova QA');await fill('date','2026-10-20');await fill('distances','3 km, 5 km, 10 km');await p.getByRole('checkbox',{name:'Marina Almeida Ativo',exact:true}).check();await p.getByRole('checkbox',{name:'Rafael Oliveira Ativo',exact:true}).check();await b('Salvar prova').click();await has('Este campo é obrigatório.');await select('distance-1','5 km');await select('distance-2','10 km');await shot('prova-participantes');await b('Salvar prova').click();await has('Prova QA');
   await profile('Marina Almeida');await has('5 km · 20/10/2026');await profile('Rafael Oliveira');await has('10 km · 20/10/2026');await shot('perfil-distancia');
   await tab.reload();await area('Próximas provas');await p.getByText('Prova QA',{exact:true}).click();const event=p.locator('.race-list details').filter({hasText:'Prova QA'});await event.getByRole('button',{name:'Editar prova',exact:true}).click();await fill('distances','3 km, 5 km');await b('Salvar prova').click();await has('Este campo é obrigatório.');await select('distance-2','3 km');await b('Salvar prova').click();await profile('Rafael Oliveira');await has('3 km · 20/10/2026');
   await area('Próximas provas');await p.getByText('Prova QA',{exact:true}).click();await event.getByRole('button',{name:'Editar prova',exact:true}).click();await p.getByRole('checkbox',{name:'Rafael Oliveira Ativo',exact:true}).uncheck();await b('Salvar prova').click();await profile('Rafael Oliveira');await has('10 km · 25/10/2026');await absent('Prova QA');
   await area('Próximas provas');await p.getByText('Prova QA',{exact:true}).click();await event.getByRole('button',{name:'Excluir prova',exact:true}).click();await p.getByRole('dialog').getByRole('button',{name:'Excluir prova',exact:true}).click();await absent('Prova QA');
   return {width,races:'passed'};
  },
  async finish(){await nav('Treinos');await b(/Rafael Oliveira/).click();await has('Tiros 200 m');await shot('treinos-preservados');const errors=await tab.dev.logs({levels:['error'],limit:100});assert.equal(errors.length,0,JSON.stringify(errors));return {width,consoleErrors:0};}
 };
}
