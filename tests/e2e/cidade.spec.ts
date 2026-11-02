import { expect, test } from '@playwright/test';
import { botao, destino, textos, tocar } from '../apoio/jogo';

test('cidade, novas missões, conselhos, diário e recompensa única no celular',async({page})=>{
  const erros:string[]=[];page.on('pageerror',e=>erros.push(e.message));
  await page.setViewportSize({width:390,height:844});await page.goto('./');
  await botao(page,'Ir para o parque');await destino(page,'Mapa da cidade');
  await expect.poll(()=>page.evaluate(()=>window.__jogo.scene.isActive('Cidade'))).toBe(true);
  await page.screenshot({path:'docs/screenshots/cidade/1-mapa-mobile.png'});
  await botao(page,'Padaria');await expect.poll(()=>page.evaluate(()=>window.__jogo.scene.isActive('Padaria'))).toBe(true);
  await page.screenshot({path:'docs/screenshots/cidade/2-padaria-mobile.png'});
  await botao(page,'Troco a mais');
  const painel=page.getByRole('region',{name:'Troco a mais',exact:true});
  await painel.getByRole('button',{name:'A) Ficar com o troco',exact:true}).click();
  await expect(painel).toContainText('Esse dinheiro faz falta');
  await painel.getByRole('button',{name:'Tentar de novo',exact:true}).click();
  await painel.getByRole('button',{name:'C) Não falar nada',exact:true}).click();
  await expect(painel).toContainText('A Dona Rosa pode não ter percebido.');
  await painel.getByRole('button',{name:'Tentar de novo',exact:true}).click();
  await painel.getByRole('button',{name:'B) Avisar e devolver',exact:true}).click();
  await expect(painel).toContainText('Missão concluída');
  await painel.getByRole('button',{name:'Brincar de novo',exact:true}).click();
  await painel.getByRole('button',{name:'B) Avisar e devolver',exact:true}).click();
  await painel.getByRole('button',{name:'Voltar a brincar',exact:true}).click();
  await expect.poll(()=>textos(page)).toContain('10 moedas');
  await botao(page,'Cidade');await botao(page,'>');await botao(page,'Pet Shop');
  await expect.poll(()=>page.evaluate(()=>window.__jogo.scene.isActive('PetShop'))).toBe(true);
  await page.screenshot({path:'docs/screenshots/cidade/3-pet-mobile.png'});
  await botao(page,'Cuidar do Bolinha');
  const pet=page.getByRole('region',{name:'Cuidar do Bolinha',exact:true});
  for(const acao of ['Dar água','Dar comida','Fazer carinho'])await pet.getByRole('button',{name:acao,exact:true}).click();
  await expect(pet).toContainText('Missão concluída');await pet.getByRole('button',{name:'Voltar a brincar',exact:true}).click();
  await expect.poll(()=>textos(page)).toContain('20 moedas');
  await botao(page,'Cidade');await botao(page,'>');await botao(page,'Casa');
  await expect.poll(()=>textos(page)).toContain('Em breve');await page.screenshot({path:'docs/screenshots/cidade/6-casa-mobile.png'});await botao(page,'Cidade');await botao(page,'Parque');
  await destino(page,'Esperar a vez');
  const bia=page.getByRole('region',{name:'Esperar a vez',exact:true});
  await bia.getByRole('button',{name:'A) Passar na frente',exact:true}).click();await expect(bia).toContainText('Esperar a vez');
  await bia.getByRole('button',{name:'Tentar de novo',exact:true}).click();
  await bia.getByRole('button',{name:'B) Esperar a Bia terminar',exact:true}).click();
  await bia.getByRole('button',{name:'Voltar a brincar',exact:true}).click();
  await destino(page,'Meu diário');const diario=page.getByRole('region',{name:'Meu diário',exact:true});
  await expect(diario.getByLabel('Valor aprendido')).toHaveCount(3);expect(await diario.getByLabel('Vamos aprender').count()).toBeGreaterThanOrEqual(1);
  await page.screenshot({path:'docs/screenshots/cidade/4-diario-mobile.png'});
  await page.setViewportSize({width:844,height:390});await expect(diario).toBeVisible();
  await expect.poll(async()=>{const caixa=(await diario.boundingBox())!;return caixa.x>=0 && caixa.y>=0 && caixa.y+caixa.height<=390}).toBe(true);
  await diario.getByRole('button',{name:'Voltar a brincar',exact:true}).click();
  await page.reload();await botao(page,'Ir para o parque');await destino(page,'Meu diário');
  await expect(page.getByRole('region',{name:'Meu diário'}).getByLabel('Valor aprendido')).toHaveCount(3);
  expect(erros).toEqual([]);
});

test('cada porta ilustrada abre o lugar correto por toque no mapa',async({page})=>{
  await page.goto('./');await botao(page,'Ir para o parque');await destino(page,'Mapa da cidade');
  for(const [cena,x,y] of [['Parque',405,305],['Padaria',1020,310],['PetShop',1130,655],['Casa',340,650]] as const){
    await expect.poll(()=>page.evaluate(()=>window.__jogo.scene.isActive('Cidade'))).toBe(true);
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    await tocar(page,x,y,'Cidade');
    await expect.poll(()=>page.evaluate(cena=>window.__jogo.scene.isActive(cena),cena)).toBe(true);
    if(cena==='Parque')await destino(page,'Mapa da cidade');else await botao(page,'Cidade');
  }
});
