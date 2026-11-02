import {describe,expect,it} from 'vitest';
import {aplicarAcao,criarEstado} from '../src/game/interacao/regras';
import type {DefinicaoObjeto,EstadoObjeto,TipoObjeto,TipoAcao} from '../src/game/interacao/tipos';
const definicao=(tipo:TipoObjeto):DefinicaoObjeto=>({id:'teste',nome:'Objeto de teste',tipo,sprite:{padrao:'teste'},origem:[.5,1],largura:100,area:[-50,-100,100,100],pontoUso:[0,20],estadoInicial:{},snaps:[{x:100,y:200,pose:tipo==='cama'?'deitado':'sentado'},{x:150,y:200,pose:tipo==='cama'?'deitado':'sentado'}],capacidade:1,comestivel:true,destino:'Casa'});
function agir(s:EstadoObjeto,d:DefinicaoObjeto,tipo:TipoAcao,jogador='laura',extra:Record<string,unknown>={}){return aplicarAcao(s,{tipo,jogador,instancia:jogador+'-aba',agora:1000,definicao:d,...extra})}
describe('regras dos sete tipos de interação',()=>{
 it('pega, come em três mordidas e não altera a entrada',()=>{
  const d=definicao('pegavel'),inicio=criarEstado(d,'Parque',100,200);let r=agir(inicio,d,'pegar');
  expect(inicio.trava).toBeNull();expect(r.estado.local).toBe('mao');expect(r.estado.versao).toBe(1);
  expect(agir(r.estado,d,'comer','bia').aceita).toBe(false);
  for(let i=0;i<3;i++)r=agir(r.estado,d,'comer');expect(r.estado.mordidas).toBe(3);expect(r.estado.local).toBe('consumido');expect(r.estado.trava).toBeNull();
  expect(agir(r.estado,d,'pegar').aceita).toBe(false);
 });
 it('solta só com posse e lembra a nova posição do chão',()=>{
  const d=definicao('pegavel'),s=agir(criarEstado(d,'Parque',100,200),d,'pegar').estado;
  expect(agir(s,d,'soltar','bia').aceita).toBe(false);
  const r=agir(s,d,'soltar','laura',{ponto:{x:300,y:400}});expect(r.estado.local).toBe('chao');expect(r.estado.origem).toEqual({x:300,y:400});
 });
 it('reserva dois snaps diferentes e não sobrepõe o terceiro jogador',()=>{
  const d=definicao('assento');let s=agir(criarEstado(d,'Parque',100,200),d,'tocar').estado;
  s=agir(s,d,'tocar','bia').estado;expect(s.ocupantes.map(o=>o.snap)).toEqual([0,1]);expect(agir(s,d,'tocar','pedro').aceita).toBe(false);
  expect(agir(s,d,'levantar').estado.ocupantes).toHaveLength(1);
 });
 it('deita na cama e dorme no segundo toque',()=>{
  const d=definicao('cama'),s=agir(criarEstado(d,'Casa',100,200),d,'tocar').estado;
  const r=agir(s,d,'tocar');expect(r.estado.noite).toBe(true);expect(r.efeitos).toContainEqual({tipo:'pose',pose:'dormindo'});
 });
 it('liga, desliga e troca o modo de aparelhos',()=>{
  const d=definicao('aparelho'),s=agir(criarEstado(d,'Casa',100,200),d,'tocar').estado;
  expect(s.ligado).toBe(true);expect(agir(s,d,'acao2').estado.modo).toBe(1);expect(agir(s,d,'tocar').estado.ligado).toBe(false);
 });
 it('abre recipiente, respeita a capacidade e retira um item',()=>{
  const d=definicao('recipiente');let s=criarEstado(d,'Casa',100,200);
  expect(agir(s,d,'guardar','laura',{item:'maca'}).aceita).toBe(false);s=agir(s,d,'tocar').estado;s=agir(s,d,'guardar','laura',{item:'maca'}).estado;
  expect(agir(s,d,'guardar','laura',{item:'pao'}).aceita).toBe(false);expect(agir(s,d,'retirar','laura',{item:'maca'}).estado.itens).toEqual([]);
 });
 it('abre porta e devolve o destino como efeito',()=>{const d=definicao('porta'),r=agir(criarEstado(d,'Parque',100,200),d,'tocar');expect(r.estado.aberto).toBe(true);expect(r.efeitos).toContainEqual({tipo:'porta',destino:'Casa'})});
 it('água alterna e produz gotas apenas quando ligada',()=>{const d=definicao('agua'),r=agir(criarEstado(d,'Parque',100,200),d,'tocar');expect(r.efeitos).toContainEqual({tipo:'particulas',nome:'gotas'});expect(agir(r.estado,d,'tocar').estado.ligado).toBe(false)});
});
