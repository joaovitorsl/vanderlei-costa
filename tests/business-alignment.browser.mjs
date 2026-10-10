import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';

// Execute with the CUA browser/tab APIs against the built local preview.
export async function runBusinessChecks(tab, browser, baseUrl, outputDir) {
  await mkdir(outputDir, {recursive:true});
  const p = tab.playwright;
  const b = name => p.getByRole('button',{name,exact:typeof name === 'string'});
  const select = (name,value) => p.getByRole('combobox',{name,exact:true}).selectOption(value);
  const value = name => p.locator(`input[name="${name}"]`).evaluate(el=>el.value);
  const nav = async name => {
    const width = await p.evaluate(()=>innerWidth);
    await p.getByRole('navigation',{name:width >= 1000 ? 'Navegação principal' : 'Navegação no celular'}).getByRole('button',{name,exact:true}).click();
  };
  const layout = async () => {
    const dimensions = await p.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,dialogs:[...document.querySelectorAll('[role="dialog"]')].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))}));
    assert.ok(dimensions.scroll <= dimensions.viewport, `horizontal overflow: ${JSON.stringify(dimensions)}`);
    for (const dialog of dimensions.dialogs) assert.ok(dialog.left>=0 && dialog.right<=dimensions.viewport+1);
  };
  const shot = async name => writeFile(`${outputDir}/${name}.jpg`,await tab.screenshot({fullPage:false}));
  const viewport = await browser.capabilities.get('viewport');
  await viewport.set({width:1440,height:1000});
  await tab.goto(`${baseUrl}?resetDemo=1`);
  await nav('Alunos'); await b(/Rafael Oliveira/).click(); await b(/^Plano Fire/).click();
  assert.equal(await p.getByText('Equivalente a R$ 70,00/mês',{exact:true}).count(),1);
  assert.equal(await p.getByText('Uniforme incluso.',{exact:true}).count(),1);
  for (const width of [360,390,430,1280,1440,1920]) {
    await viewport.set({width,height:width<1000 ? 844 : 1000});
    await p.domSnapshot(); await layout(); await shot(`${width}-plano-fire`);
    await b('Editar plano').click(); await p.domSnapshot(); await layout(); await shot(`${width}-editar-plano`);
    assert.equal(await value('value'),'420');
    assert.equal(await value('renewalDate'),'2026-10-10');
    await b(width<1000 ? 'Voltar sem salvar' : 'Fechar').click();
    await nav('Treinos'); await b(/Rafael Oliveira/).click(); await p.domSnapshot(); await layout();
    await b('Editar treino').first().click();
    assert.equal(await value('location'),'Açude Velho');
    await p.domSnapshot(); await layout(); await shot(`${width}-editar-treino-local`);
    await b('Cancelar').click(); await b('Ver perfil').click(); await b(/^Plano Fire/).click();
  }
  await viewport.set({width:390,height:844});
  await nav('Alunos'); await b('Novo aluno').click();
  await p.getByLabel('Nome completo',{exact:true}).fill('Aluno QA Alinhamento');
  await p.getByLabel('Data de nascimento',{exact:true}).fill('1990-05-12');
  await p.locator('input[name="birth"]').press('ArrowUp'); await p.locator('input[name="birth"]').press('ArrowDown');
  await select('Camisa','G'); await b('Continuar').click();
  await select('Modalidade','Corrida de rua'); await select('Objetivo','3 km'); await select('Nível','Iniciante');
  await b('Continuar').click(); assert.equal(await value('value'),'80');
  await select('Plano comercial','Fire'); assert.equal(await value('value'),'420');
  await select('Plano comercial','Família'); assert.equal(await value('value'),'150');
  await b('Salvar aluno').click(); await b(/Aluno QA Alinhamento/).click(); await b(/^Plano Família/).click();
  assert.equal(await p.getByText('Avaliação física com peso, medidas e bioimpedância inclusa.',{exact:true}).count(),1);
  await shot('390-plano-familia'); await b('Editar plano').click();
  await select('Plano comercial','Fire'); await p.getByLabel('Renovação',{exact:true}).fill('2027-04-10');
  await p.locator('input[name="renewalDate"]').press('ArrowUp'); await p.locator('input[name="renewalDate"]').press('ArrowDown');
  await b('Salvar aluno').click(); await tab.reload(); await nav('Alunos');
  await b(/Aluno QA Alinhamento/).click(); await b(/^Plano Fire/).click();
  assert.equal(await p.getByText('10 abr',{exact:true}).count(),1);
  await b('Aluno QA Alinhamento').click(); await b('Dados cadastrais').click(); await b('Editar').click();
  assert.equal(await p.getByRole('combobox',{name:'Camisa',exact:true}).evaluate(el=>el.value),'G');
  await p.getByLabel('Nome completo',{exact:true}).fill('Aluno QA Editado');
  await b('Continuar').click(); await b('Continuar').click(); await b('Salvar aluno').click();
  await nav('Treinos'); await b(/Rafael Oliveira/).click();
  await b('Adicionar treino').first().click(); await b(/Usar modelo/).click(); await b(/^Tiros 200 m 6/).click();
  await p.locator('input[name="location"]').fill('Parque de exemplo');
  for (const type of ['Intervalado por tempo','Rodagem','Tiros']) {
    await select('Tipo de treino',type); assert.equal(await value('location'),'Parque de exemplo');
  }
  await p.getByLabel('Nome',{exact:true}).fill('Treino QA Local'); await b('Salvar treino').click();
  assert.equal(await p.getByRole('article').filter({hasText:'Treino QA Local'}).getByText('📍 Parque de exemplo',{exact:true}).count(),1);
  await tab.reload(); await nav('Treinos'); await b(/Rafael Oliveira/).click();
  await p.getByRole('article').filter({hasText:'Treino QA Local'}).getByRole('button',{name:'Editar treino'}).click();
  assert.equal(await value('location'),'Parque de exemplo');
  await p.locator('input[name="location"]').fill(''); await b('Salvar treino').click();
  assert.equal(await p.getByRole('article').filter({hasText:'Treino QA Local'}).getByText(/📍/).count(),0);
  await b('Adicionar treino').first().click(); await b(/Criar treino Preencher/).click();
  await p.getByLabel('Nome',{exact:true}).fill('Treino QA sem local'); await b('Salvar treino').click();
  assert.equal(await p.getByRole('article').filter({hasText:'Treino QA sem local'}).count(),1);
  await tab.goto(`${baseUrl}?resetDemo=1`); await nav('Alunos');
  assert.equal(await b(/Aluno QA Editado/).count(),0);
  await b(/Rafael Oliveira/).click(); await b(/^Plano Fire/).click();
  assert.equal(await p.getByText('10 out',{exact:true}).count(),1);
  assert.equal((await tab.dev.logs({levels:['error'],limit:100})).length,0);
  await viewport.reset();
  return {viewports:[360,390,430,1280,1440,1920],flows:['cadastro','edição','planos','perfil','criação e edição de treino','modelo','troca de tipo','local opcional','persistência','reset'],consoleErrors:0};
}
