import {CATALOGO_CASA} from '../../src/game/casa/catalogo';
import {expect,test,type Page} from '@playwright/test';
import {botao} from '../apoio/jogo';
import type {CenaComodo} from '../../src/scenes/CenaComodo';
const cena=(page:Page,id:string)=>page.evaluate(id=>{const c=window.__jogo.scene.getScene('Casa') as CenaComodo;return c.transporte.ler().find(s=>s.id===id)!},id);
async function comodo(page:Page,nome:string){await botao(page,'Cômodos');await page.getByRole('button',{name:nome,exact:true}).click();await expect(page.getByRole('region',{name:'Cômodos',exact:true})).not.toBeVisible();await page.waitForTimeout(550)}
async function usar(page:Page,id:string){const nome=CATALOGO_CASA.find(d=>d.id===id)!.nome;await botao(page,`Usar ${nome}`)}
async function fechar(page:Page){await page.getByRole('button',{name:'Voltar a brincar',exact:true}).click()}
test('casa tem seis cômodos, recipientes, sono e itens persistentes por toque',async({page})=>{
 const erros:string[]=[];page.on('pageerror',e=>erros.push(e.message));await page.setViewportSize({width:390,height:844});await page.goto('./');await botao(page,'Ir para o parque');
 await page.evaluate(()=>{window.__jogo.scene.stop('Parque');window.__jogo.scene.start('Casa')});
 await expect(page.getByRole('button',{name:'Celular',exact:true})).toBeVisible();
 await usar(page,'sofa');await expect.poll(async()=>(await cena(page,'sofa')).ocupantes.length).toBe(1);await fechar(page);await page.screenshot({path:'docs/screenshots/casa/1-sala.png'});await usar(page,'tv');await fechar(page);await expect.poll(async()=>(await cena(page,'tv')).ligado).toBe(true);
 await comodo(page,'Quarto');await usar(page,'cama');await page.getByRole('button',{name:'Dormir',exact:true}).click();await expect.poll(async()=>(await cena(page,'cama')).noite).toBe(true);await page.screenshot({path:'docs/screenshots/casa/2-quarto.png'});
 await comodo(page,'Cozinha');await usar(page,'pao');await expect.poll(async()=>(await cena(page,'pao')).local).toBe('mao');await usar(page,'torradeira');await fechar(page);await expect.poll(async()=>(await cena(page,'pao')).modo).toBe(2);await usar(page,'geladeira');await page.getByRole('button',{name:'Pegar Maçã',exact:true}).click();await expect.poll(async()=>(await cena(page,'maca')).local).toBe('mao');await page.screenshot({path:'docs/screenshots/casa/3-cozinha.png'});
 await comodo(page,'Banheiro');await botao(page,'Mochila');await page.getByRole('button',{name:'Soltar aqui',exact:true}).click();await expect.poll(async()=>(await cena(page,'maca')).comodo).toBe('banheiro');await page.screenshot({path:'docs/screenshots/casa/4-banheiro.png'});
 await comodo(page,'Lavanderia');await usar(page,'cesto');await page.getByRole('button',{name:'Pegar Roupa',exact:true}).click();await expect.poll(async()=>(await cena(page,'roupa-suja')).local).toBe('mao');await usar(page,'maquina');await fechar(page);await expect.poll(async()=>(await cena(page,'roupa-suja')).modo,{timeout:10000}).toBe(1);await page.screenshot({path:'docs/screenshots/casa/5-lavanderia.png'});
 await comodo(page,'Quintal');await page.screenshot({path:'docs/screenshots/casa/6-quintal.png'});
 await page.reload();await botao(page,'Ir para o parque');await page.evaluate(()=>{window.__jogo.scene.stop('Parque');window.__jogo.scene.start('Casa')});await expect(page.getByRole('button',{name:'Celular',exact:true})).toBeVisible();
 expect(await cena(page,'maca')).toMatchObject({local:'chao',comodo:'banheiro'});expect(await cena(page,'roupa-suja')).toMatchObject({modo:1});expect((await cena(page,'geladeira')).aberto).toBe(true);expect((await cena(page,'tv')).ligado).toBe(true);
 for(let i=0;i<2;i++){await botao(page,'Mochila');await page.getByRole('button',{name:'Arrumar tudo',exact:true}).click();await expect.poll(async()=>(await cena(page,'maca')).comodo).toBe('cozinha');await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mtmw:progresso:v1')!).moedas)).toBe(1)}
 expect(erros).toEqual([]);
});
