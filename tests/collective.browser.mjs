import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

// Run through the CUA tab/browser APIs against a disposable local demo preview.
export async function runCollectiveChecks(tab,browser,baseUrl,outputDir,width) {
  await mkdir(outputDir,{recursive:true});
  const p=tab.playwright,b=name=>p.getByRole('button',{name,exact:typeof name==='string'});
  const nav=async name=>{await p.getByRole('navigation',{name:width<1000?'Navegação no celular':'Navegação principal'}).getByRole('button',{name,exact:true}).click();await p.domSnapshot();};
  const snapshot=()=>p.domSnapshot();
  const has=async text=>assert.ok((await snapshot()).includes(text),`Missing: ${text}`);
  const absent=async text=>assert.ok(!(await snapshot()).includes(text),`Unexpected: ${text}`);
  const fill=async(name,value)=>{const input=p.locator(`input[name="${name}"]`);await input.fill(value);const type=await input.getAttribute('type');if(type==='date'||type==='time'){await input.press('ArrowUp');await input.press('ArrowDown');}};
  const layout=async()=>{const dim=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,dialogs:[...document.querySelectorAll('[role=dialog]')].map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))}));assert.ok(dim.scroll<=dim.width,JSON.stringify(dim));for(const d of dim.dialogs)assert.ok(d.left>=0&&d.right<=dim.width+1);};
  const shot=async name=>{await layout();await tab.getAXState({emit:false});await writeFile(`${outputDir}/${width}-${name}.jpg`,await tab.getScreenshot({emit:false}));};
  await (await browser.capabilities.get('viewport')).set({width,height:width<1000?844:1000});
  await tab.goto(`${baseUrl}?resetDemo=1`);
  await has('Treino coletivo 05:20 · Plínio Lemos 18:20 · Açude Velho');await shot('home');
  await b(/^Treino coletivo/).click();await has('Agenda coletiva');assert.equal(await p.getByRole('article').count(),5);await shot('agenda');
  await b('Adicionar encontro').click();await b('Salvar encontro').click();await has('Este campo é obrigatório.');
  await fill('date','2026-10-09');await fill('time','07:15');await fill('location','Local QA');await fill('title','Encontro QA');await p.locator('textarea[name="notes"]').fill('Referência QA');await shot('adicionar-encontro');
  await b('Salvar encontro').click();await has('Encontro QA');await has('07:15');await tab.reload();await nav('Mais');await b(/^Agenda coletiva/).click();await has('Encontro QA');
  await b('Editar 07:15 · Encontro QA').click();await fill('time','08:30');await fill('location','Local atualizado');await b('Salvar encontro').click();await has('Local atualizado');await has('08:30');
  await b('Excluir 08:30 · Encontro QA').click();await b('Cancelar').click();await has('Encontro QA');await b('Excluir 08:30 · Encontro QA').click();await p.getByRole('dialog').getByRole('button',{name:'Excluir',exact:true}).click();await absent('Encontro QA');
  await b('Próxima semana').click();await has('Domingo livre');await has('Treino individual no horário e local de sua preferência.');await shot('domingo-livre');
  await b('Adicionar encontro').click();await p.getByRole('combobox',{name:'Tipo de registro'}).selectOption('free-sunday');await fill('date','2026-10-16');await b('Salvar domingo livre').click();await has('Escolha um domingo');await fill('date','2026-10-18');await b('Salvar domingo livre').click();await has('Este dia já tem');await fill('date','2026-10-25');await b('Salvar domingo livre').click();await has('domingo 25');
  await b('Excluir domingo livre').click();await p.getByRole('dialog').getByRole('button',{name:'Excluir',exact:true}).click();await has('Nenhum encontro cadastrado nesta semana.');
  await b('Voltar para esta semana').click();
  for(const label of ['Excluir 05:20 · Plínio Lemos','Excluir 18:20 · Açude Velho']){await b(label).click();await p.getByRole('dialog').getByRole('button',{name:'Excluir',exact:true}).click();}
  await nav('Início');await absent('Treino coletivo');await has('4 atletas com treino');
  await nav('Mais');await b('Próximas provas').click();await p.getByText('Circuito Parque Verde',{exact:true}).click();await has('Marina Almeida');await has('Letícia Barros');await shot('provas');
  await b('Nova prova').click();await b('Salvar prova').click();await has('Este campo é obrigatório.');await fill('name','Prova QA');await fill('date','2026-10-20');await fill('distance','5 km');await fill('location','Local da prova');
  await p.getByRole('checkbox',{name:'Rafael Oliveira Ativo',exact:true}).check();await p.getByRole('checkbox',{name:'Marina Almeida Ativo',exact:true}).check();await shot('nova-prova');await b('Salvar prova').click();await has('Prova QA');
  await tab.reload();await nav('Alunos');await b(/Rafael Oliveira/).click();await has('Prova QA');await has('20/10/2026 · 5 km');await shot('perfil-prova');
  await b('Dados cadastrais').click();await absent('Próxima prova');await b('Editar').click();await b('2 Corrida').click();await absent('Data da prova');await absent('Próxima prova');await absent('Distância da prova');await shot('cadastro-corrida');await b(width<1000?'Voltar sem salvar':'Fechar').click();
  await nav('Mais');await b('Próximas provas').click();await p.getByText('Prova QA',{exact:true}).click();await p.locator('.race-list details').filter({hasText:'Prova QA'}).getByRole('button',{name:'Editar prova',exact:true}).click();
  await p.getByRole('checkbox',{name:'Rafael Oliveira Ativo',exact:true}).uncheck();await fill('name','Prova QA editada');await fill('date','2026-10-19');await b('Salvar prova').click();await nav('Alunos');await b(/Rafael Oliveira/).click();await has('Meia da Primavera');await absent('Prova QA');
  await nav('Alunos');await b(/Marina Almeida/).click();await has('Prova QA editada');
  await nav('Mais');await b('Próximas provas').click();await p.getByText('Prova QA editada',{exact:true}).click();await p.locator('.race-list details').filter({hasText:'Prova QA editada'}).getByRole('button',{name:'Excluir prova',exact:true}).click();await b('Cancelar').click();await has('Prova QA editada');await p.locator('.race-list details').filter({hasText:'Prova QA editada'}).getByRole('button',{name:'Excluir prova',exact:true}).click();await p.getByRole('dialog').getByRole('button',{name:'Excluir prova',exact:true}).click();await absent('Prova QA editada');
  await nav('Alunos');await b(/Marina Almeida/).click();await has('Circuito Parque Verde');
  await nav('Treinos');await b(/Rafael Oliveira/).click();await absent('📍');await b('Adicionar treino').first().click();await b(/^Usar modelo/).click();await b(/^Tiros 200 m/).click();assert.equal(await p.locator('input[name="location"]').count(),0);await fill('title','Tiros QA');await p.locator('textarea[name="notes"]').fill('Orientação individual');await shot('treino-sem-local');await b('Salvar treino').click();await has('Tiros QA');
  await p.getByRole('article').filter({hasText:'Tiros QA'}).getByRole('button',{name:'Editar treino',exact:true}).click();assert.equal(await p.locator('input[name="location"]').count(),0);await has('Orientação individual');await b('Cancelar').click();
  await tab.reload();await nav('Mais');await b('Próximas provas').click();await absent('Prova QA');await nav('Início');await absent('Treino coletivo');
  assert.equal((await tab.dev.logs({levels:['error'],limit:100})).length,0);
  return {width,passed:true,flows:['agenda CRUD','domingo livre','conflitos','Home condicional','provas CRUD','participantes','perfil derivado','cadastro sem prova','treino sem local','persistência'],consoleErrors:0};
}
