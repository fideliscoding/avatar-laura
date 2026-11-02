import {aplicarAcao} from './regras';
import {daInstancia,estadoEfetivo} from './travas';
import type {AcaoInteracao,ConfirmacaoInteracao,DefinicaoObjeto,EstadoObjeto} from './tipos';
import type {Inventario} from './inventario';
export function inventarioDoMundo(estados:EstadoObjeto[],jogador:string,instancia:string,agora:number):Inventario{
 const proprios=estados.map(s=>estadoEfetivo(s,agora)).filter(s=>daInstancia(s.trava,jogador,instancia));
 return {mao:proprios.find(s=>s.local==='mao')?.id??null,mochila:proprios.filter(s=>s.local==='mochila').map(s=>s.id)};
}
/** Calcula as mudanças como um lote: negar o item novo não altera a mão anterior. */
export function aplicarNoMundo(estados:EstadoObjeto[],acao:AcaoInteracao,catalogo:DefinicaoObjeto[]):ConfirmacaoInteracao{
 const s=estados.find(s=>s.id===acao.definicao.id);if(!s)return {aceita:false,estados,efeitos:[]};
 const inv=inventarioDoMundo(estados,acao.jogador,acao.instancia,acao.agora);
 if(acao.tipo==='guardar'&&s.tipo==='pegavel'&&inv.mochila.length>=6)return {aceita:false,estados,efeitos:[{tipo:'fala',codigo:'cheio'}]};
 const r=aplicarAcao(s,acao);if(!r.aceita)return {...r,estados};
 const alterados=new Map<string,EstadoObjeto>([[s.id,r.estado]]);
 if(r.estado.local==='mao'&&inv.mao&&inv.mao!==s.id){
  const anterior=estados.find(s=>s.id===inv.mao)!,definicao=catalogo.find(d=>d.id===anterior.id)!;
  const troca=aplicarAcao(anterior,{...acao,definicao,versao:undefined,tipo:inv.mochila.filter(id=>id!==s.id).length<6?'guardar':'soltar'});if(troca.aceita)alterados.set(anterior.id,troca.estado);
 }
 if(['assento','cama'].includes(s.tipo)&&r.estado.ocupantes.some(o=>daInstancia(o,acao.jogador,acao.instancia))){
  for(const anterior of estados.filter(outro=>outro.id!==s.id&&outro.ocupantes.some(o=>daInstancia(o,acao.jogador,acao.instancia)))){
   const definicao=catalogo.find(d=>d.id===anterior.id)!;const saida=aplicarAcao(anterior,{...acao,definicao,versao:undefined,tipo:'levantar'});if(saida.aceita)alterados.set(anterior.id,saida.estado);
  }
 }
 return {aceita:true,estados:estados.map(s=>alterados.get(s.id)??s),efeitos:r.efeitos};
}
