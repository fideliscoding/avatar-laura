import {expect,test} from '@playwright/test';
import {botao,destino,tocar} from '../apoio/jogo';
import type {GerenteInteracao} from '../../src/scenes/interacao/GerenteInteracao';
import type Phaser from 'phaser';
type Parque={interacoes:GerenteInteracao;L:{x:number;y:number;img:Phaser.GameObjects.Image}};
test('banco, mochila, três mordidas e água funcionam por toque no celular',async({page})=>{
 const erros:string[]=[];page.on('pageerror',e=>erros.push(e.message));
 await page.setViewportSize({width:390,height:844});await page.goto('./');await botao(page,'Ir para o parque');
 await destino(page,'Sentar no banco');
 await expect.poll(()=>page.evaluate(()=>(window.__jogo.scene.getScene('Parque') as unknown as Parque).interacoes.avatar.pose)).toBe('sentado');
 await page.screenshot({path:'docs/screenshots/interacoes/1-banco-mobile.png'});
 await destino(page,'Levantar');
 await expect.poll(()=>page.evaluate(()=>(window.__jogo.scene.getScene('Parque') as unknown as Parque).interacoes.avatar.pose)).toBe('em-pe');
 await destino(page,'Pegar sorvete');
 await expect.poll(()=>page.evaluate(()=>(window.__jogo.scene.getScene('Parque') as unknown as Parque).interacoes.inventario().mao)).toBe('sorvete-parque');
 const profundidade=await page.evaluate(()=>{const p=window.__jogo.scene.getScene('Parque') as unknown as Parque;return {avatar:p.L.img.depth,item:p.interacoes.objetos.get('sorvete-parque')!.imagem.depth}});
 expect(profundidade.item).toBeCloseTo(profundidade.avatar+1);
 await page.getByRole('button',{name:'Mochila',exact:true}).click();
 const mochila=page.getByRole('region',{name:'Mochila',exact:true});await expect(mochila).toContainText('Na mão: Sorvete');
 await mochila.getByRole('button',{name:'Guardar na mochila',exact:true}).click();
 await page.getByRole('button',{name:'Mochila',exact:true}).click();await expect(mochila).toContainText('Espaços na mochila: 1/6');
 await page.screenshot({path:'docs/screenshots/interacoes/2-mochila-mobile.png'});
 await mochila.getByRole('button',{name:'Sorvete',exact:true}).click();
  await expect(mochila).not.toBeVisible();
  await expect.poll(()=>page.evaluate(()=>(window.__jogo.scene.getScene('Parque') as unknown as Parque).interacoes.inventario().mao)).toBe('sorvete-parque');
 for(let i=1;i<=3;i++){
  const pos=await page.evaluate(()=>{const l=(window.__jogo.scene.getScene('Parque') as unknown as Parque).L;return {x:l.x,y:l.y-90}});
  await tocar(page,pos.x,pos.y);
  await expect.poll(()=>page.evaluate(()=>(window.__jogo.scene.getScene('Parque') as unknown as Parque).interacoes.estados().find(s=>s.id==='sorvete-parque')!.mordidas)).toBe(i);
 }
 await destino(page,'Bebedouro');
 await expect.poll(()=>page.evaluate(()=>(window.__jogo.scene.getScene('Parque') as unknown as Parque).interacoes.estados().find(s=>s.id==='bebedouro-parque')!.ligado)).toBe(true);
 await page.screenshot({path:'docs/screenshots/interacoes/3-agua-mobile.png'});
 expect(erros).toEqual([]);
});
