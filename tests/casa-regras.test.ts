import {describe,expect,it} from 'vitest';
import {CATALOGO_CASA,estadosIniciaisCasa} from '../src/game/casa/catalogo';
import {aplicarCasa} from '../src/game/casa/regras';
import type {AcaoInteracao,EstadoObjeto,TipoAcao} from '../src/game/interacao/tipos';
const usuario='11111111-1111-4111-8111-111111111111';
function acao(e:EstadoObjeto[],id:string,tipo:TipoAcao,extra:Partial<AcaoInteracao>={}){return aplicarCasa(e,{definicao:CATALOGO_CASA.find(d=>d.id===id)!,tipo,jogador:usuario,instancia:'aba',agora:1000,versao:e.find(s=>s.id===id)!.versao,...extra})}
describe('sala e quarto',()=>{
 it('retira do recipiente sem duplicar itens e permite guardar de volta',()=>{
  let e=acao(estadosIniciaisCasa(),'estante','tocar').estados;
  const r=acao(e,'estante','retirar',{item:'livro'});expect(r.aceita).toBe(true);e=r.estados;
  expect(e.find(s=>s.id==='livro')).toMatchObject({local:'mao',aberto:true});expect(e.find(s=>s.id==='estante')!.itens).not.toContain('livro');
  expect(acao(e,'estante','retirar',{item:'livro'}).aceita).toBe(false);
  e=acao(e,'estante','guardar',{item:'livro'}).estados;
  expect(e.find(s=>s.id==='livro')).toMatchObject({local:'consumido',trava:null,aberto:false});
 });
 it('sofá tem três snaps e cama dorme no segundo toque',()=>{
  expect(CATALOGO_CASA.find(d=>d.id==='sofa')!.snaps).toHaveLength(3);
  const e=acao(estadosIniciaisCasa(),'cama','tocar').estados;expect(acao(e,'cama','tocar').estados.find(s=>s.id==='cama')!.noite).toBe(true);
 });
 it('rejeita interação com móvel de outro cômodo',()=>{expect(acao(estadosIniciaisCasa(),'sofa','tocar',{comodo:'banheiro'}).aceita).toBe(false)});
});
describe('cozinha por receitas',()=>{
 it('torradeira transforma pão e exige o prazo do preparo',()=>{
  let e=acao(estadosIniciaisCasa(),'pao','pegar').estados;e=acao(e,'torradeira','tocar').estados;
  expect(e.find(s=>s.id==='pao')!.local).toBe('consumido');
  e=acao(e,'torradeira','acao2').estados;expect(e.find(s=>s.id==='pao')).toMatchObject({local:'chao',modo:2});
 });
 it('micro-ondas só libera depois de três segundos e preserva o prazo no estado',()=>{
  let e=acao(estadosIniciaisCasa(),'pao','pegar').estados;e=acao(e,'micro-ondas','tocar').estados;
  expect(e.find(s=>s.id==='micro-ondas')!.prontoEm).toBe(4000);expect(acao(e,'micro-ondas','acao2',{agora:3999}).aceita).toBe(false);
  expect(acao(e,'micro-ondas','acao2',{agora:4000}).estados.find(s=>s.id==='pao')!.modo).toBe(1);
 });
 it('fogão exige a panela antes de preparar o ovo',()=>{
  let e=acao(estadosIniciaisCasa(),'geladeira','tocar').estados;e=acao(e,'geladeira','retirar',{item:'ovo'}).estados;
  expect(acao(e,'fogao','tocar').estados.find(s=>s.id==='ovo')!.local).toBe('mao');
  e=acao(e,'panela','pegar').estados;e=acao(e,'fogao','tocar').estados;e=acao(e,'ovo','retirar').estados;e=acao(e,'fogao','tocar').estados;
  expect(e.find(s=>s.id==='fogao')!.itens).toEqual(['panela','ovo']);
 });
});
describe('banheiro e lavanderia',()=>{
 it('lava roupa em cinco segundos e só permite pendurar depois de limpa',()=>{
  let e=acao(estadosIniciaisCasa(),'cesto','tocar').estados;e=acao(e,'cesto','retirar',{item:'roupa-suja'}).estados;
  expect(acao(e,'varal','guardar',{item:'roupa-suja'}).aceita).toBe(false);
  e=acao(e,'maquina','tocar').estados;expect(acao(e,'maquina','acao2',{agora:5999}).aceita).toBe(false);
  e=acao(e,'maquina','acao2',{agora:6000}).estados;expect(e.find(s=>s.id==='roupa-suja')!.modo).toBe(1);
 });
 it('sanitário preserva privacidade e dá feedback de descarga ao levantar',()=>{
  let e=acao(estadosIniciaisCasa(),'sanitario','tocar').estados;expect(e.find(s=>s.id==='sanitario')!.aberto).toBe(true);
  const r=acao(e,'sanitario','levantar');expect(r.estados.find(s=>s.id==='sanitario')!.aberto).toBe(false);expect(r.efeitos).toContainEqual({tipo:'particulas',nome:'gotas'});
 });
 it('escova na mão ativa espuma e o ferro só está disponível junto da Vovó',()=>{
  let e=acao(estadosIniciaisCasa(),'armarinho','tocar').estados;e=acao(e,'armarinho','retirar',{item:'escova'}).estados;
  expect(acao(e,'pia-banheiro','tocar').estados.find(s=>s.id==='escova')!.modo).toBe(1);
  expect(acao(estadosIniciaisCasa(),'ferro','tocar').aceita).toBe(true);const semAdulto=estadosIniciaisCasa().map(s=>s.id==='ferro'?{...s,comodo:'quintal'}:s);expect(acao(semAdulto,'ferro','tocar').aceita).toBe(false);
 });
});
describe('quintal',()=>{
 it('precisa de sementes e rega as flores em três estágios sem ultrapassar o final',()=>{
  let e=estadosIniciaisCasa();expect(acao(e,'canteiro','tocar').aceita).toBe(false);
  e=acao(e,'bau','tocar').estados;e=acao(e,'bau','retirar',{item:'sementes'}).estados;e=acao(e,'canteiro','tocar').estados;
  expect(e.find(s=>s.id==='canteiro')).toMatchObject({aberto:true,modo:0});
  for(let i=1;i<=3;i++){e=acao(e,'mangueira','tocar').estados;expect(e.find(s=>s.id==='canteiro')!.modo).toBe(Math.min(i,2))}
 });
});
describe('arrumação e segredos',()=>{
 it.each(['tapete','luz-quarto','banheira'])('segunda ação revela %s e mantém o segredo no estado',id=>{const r=acao(estadosIniciaisCasa(),id,'acao2');expect(r.estados.find(s=>s.id===id)!.modo).toBe(2);expect(r.efeitos).toContainEqual({tipo:'particulas',nome:'brilho'})});
 it('arrumar devolve à origem, fecha objetos e libera mão e snaps num único lote',()=>{
  let e=acao(estadosIniciaisCasa(),'pao','pegar').estados;e=acao(e,'pao','soltar',{comodo:'banheiro',ponto:{x:600,y:550}}).estados;e=acao(e,'sofa','tocar').estados;
  const r=acao(e,'tapete','arrumar');expect(r.aceita).toBe(true);expect(r.estados.find(s=>s.id==='pao')).toMatchObject({x:220,y:640,local:'chao',comodo:'cozinha'});expect(r.estados.every(s=>!s.trava&&s.ocupantes.length===0)).toBe(true);
 });
});

it('casinha do pet também move itens atomicamente para dentro e para fora',()=>{
 let e=acao(estadosIniciaisCasa(),'bau','tocar').estados;e=acao(e,'bau','retirar',{item:'ursinho'}).estados;e=acao(e,'casinha-pet','tocar').estados;e=acao(e,'casinha-pet','guardar',{item:'ursinho'}).estados;
 expect(e.find(s=>s.id==='ursinho')!.local).toBe('consumido');expect(e.find(s=>s.id==='casinha-pet')!.itens).toEqual(['ursinho']);
 expect(acao(e,'casinha-pet','retirar',{item:'ursinho'}).estados.find(s=>s.id==='ursinho')!.local).toBe('mao');
});
