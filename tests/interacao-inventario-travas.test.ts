import {describe,expect,it} from 'vitest';
import {guardarMao,inventarioVazio,pegarItem,removerItem} from '../src/game/interacao/inventario';
import {estadoEfetivo,pedirTrava} from '../src/game/interacao/travas';
import {aplicarAcao,criarEstado} from '../src/game/interacao/regras';
import type {DefinicaoObjeto} from '../src/game/interacao/tipos';
const d:DefinicaoObjeto={id:'sorvete',nome:'Sorvete',tipo:'pegavel',sprite:{padrao:'sorvete'},origem:[.5,1],largura:36,area:[-32,-64,64,64],pontoUso:[0,20],estadoInicial:{},comestivel:true};
describe('mão e mochila',()=>{
 it('troca a mão e guarda o anterior sem duplicar',()=>{const a=pegarItem(inventarioVazio(),'a').inventario,b=pegarItem(a,'b').inventario;expect(b).toEqual({mao:'b',mochila:['a']});expect(pegarItem(b,'a').inventario).toEqual({mao:'a',mochila:['b']})});
 it('solta o anterior quando os seis espaços estão cheios',()=>{const r=pegarItem({mao:'a',mochila:['b','c','d','e','f','g']},'h');expect(r.solto).toBe('a');expect(r.inventario.mochila).toHaveLength(6);expect(guardarMao(r.inventario).aceita).toBe(false)});
 it('guarda, retira e elimina a mão sem perder os outros itens',()=>{const inv=guardarMao({mao:'a',mochila:['b']}).inventario;expect(inv).toEqual({mao:null,mochila:['b','a']});expect(removerItem(inv,'a')).toEqual({mao:null,mochila:['b']})});
});
describe('travas com versão e prazo',()=>{
 it('só o primeiro jogador com a versão atual pega o mesmo sorvete',()=>{
  const s=criarEstado(d,'Parque',100,200),primeiro=aplicarAcao(s,{tipo:'pegar',jogador:'laura',instancia:'aba-a',agora:1000,versao:0,definicao:d});
  const segundo=aplicarAcao(primeiro.estado,{tipo:'pegar',jogador:'bia',instancia:'aba-b',agora:1000,versao:0,definicao:d});
  expect(primeiro.aceita).toBe(true);expect(segundo.aceita).toBe(false);expect(segundo.estado.trava?.jogador).toBe('laura');
 });
 it('separa abas da mesma conta e aceita depois de oito segundos',()=>{
  const trava=pedirTrava(null,'laura','aba-a',1000,0,0)!;expect(pedirTrava(trava,'laura','aba-b',2000,1,1)).toBeNull();expect(pedirTrava(trava,'laura','aba-b',9000,1,1)?.instancia).toBe('aba-b');
 });
 it('expiração devolve ao chão mesmo sem resposta da autoridade',()=>{
  const s=aplicarAcao(criarEstado(d,'Parque',100,200),{tipo:'pegar',jogador:'bia',instancia:'aba-b',agora:1000,definicao:d}).estado;
  expect(estadoEfetivo(s,8999).local).toBe('mao');expect(estadoEfetivo(s,9000)).toMatchObject({local:'chao',x:100,y:200,trava:null});expect(s.trava).not.toBeNull();
 });
});
