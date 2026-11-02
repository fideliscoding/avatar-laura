import {expect,it} from 'vitest';
import {aplicarNoMundo,inventarioDoMundo} from '../src/game/interacao/mundo';
import {criarEstado} from '../src/game/interacao/regras';
import {CATALOGO_OBJETOS} from '../src/game/interacao/catalogo';
const a={...CATALOGO_OBJETOS[1],id:'a'},b={...CATALOGO_OBJETOS[1],id:'b'},catalogo=[a,b];
it('trocar a mão guarda o anterior em lote e sem duplicá-lo',()=>{
 const estados=catalogo.map(d=>criarEstado(d,'Parque',100,200));
 const primeira=aplicarNoMundo(estados,{tipo:'pegar',definicao:a,jogador:'laura',instancia:'aba',agora:1000},catalogo);
 const segunda=aplicarNoMundo(primeira.estados,{tipo:'pegar',definicao:b,jogador:'laura',instancia:'aba',agora:1000},catalogo);
 expect(inventarioDoMundo(segunda.estados,'laura','aba',1000)).toEqual({mao:'b',mochila:['a']});
});
it('negar o novo objeto deixa a mão anterior como estava',()=>{
 let estados=catalogo.map(d=>criarEstado(d,'Parque',100,200));
 for(const [def,jogador]of [[a,'laura'],[b,'bia']] as const)estados=aplicarNoMundo(estados,{tipo:'pegar',definicao:def,jogador,instancia:jogador,agora:1000},catalogo).estados;
 const r=aplicarNoMundo(estados,{tipo:'pegar',definicao:b,jogador:'laura',instancia:'laura',agora:1000},catalogo);
 expect(r.aceita).toBe(false);expect(inventarioDoMundo(r.estados,'laura','laura',1000).mao).toBe('a');
});
