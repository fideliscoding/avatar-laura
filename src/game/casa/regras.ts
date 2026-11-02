import {receitaPara} from './receitas';
import {CATALOGO_CASA,COMODOS,estadosIniciaisCasa} from './catalogo';
import {aplicarNoMundo,inventarioDoMundo} from '../interacao/mundo';
import {daInstancia,estadoEfetivo} from '../interacao/travas';
import type {AcaoInteracao,ConfirmacaoInteracao,EstadoObjeto} from '../interacao/tipos';
/** Transações da casa: um lote contém tanto o recipiente quanto o item movimentado. */
export function aplicarCasa(estados:EstadoObjeto[],a:AcaoInteracao):ConfirmacaoInteracao{
 const s=estados.find(s=>s.id===a.definicao.id)!,d=CATALOGO_CASA.find(d=>d.id===s?.id);
 const negar=():ConfirmacaoInteracao=>({aceita:false,estados,efeitos:[{tipo:'fala',codigo:'mudou'}]});
 if(!s||!d)return negar();
 if(a.comodo&&s.comodo!==a.comodo&&!daInstancia(s.trava,a.jogador,a.instancia)&&!['renovar','levantar','expirar'].includes(a.tipo))return negar();
 const inv=inventarioDoMundo(estados,a.jogador,a.instancia,a.agora);
 const mao=estados.find(e=>e.id===inv.mao);
 const alterar=(mudancas:EstadoObjeto[]):ConfirmacaoInteracao=>({aceita:true,estados:estados.map(e=>{const m=mudancas.find(m=>m.id===e.id);return m?{...m,versao:e.versao+1}:e}),efeitos:[{tipo:'anim',nome:'toque'},{tipo:'particulas',nome:'brilho'}]});
 if(['cozinhar','aquecer','torrar','lavar-roupa'].includes(d.funcao)){
  if(a.versao!==s.versao)return negar();
  if(a.tipo==='acao2'&&s.prontoEm){
   if(a.agora<s.prontoEm)return negar();const item=estados.find(e=>s.itens.includes(e.id)&&!!receitaPara(s.id,e.id));if(!item)return negar();
   return alterar([{...s,ligado:false,prontoEm:0,itens:s.itens.filter(i=>i!==item.id)},{...item,local:'chao',x:s.x,y:s.y+45,origem:{x:s.x,y:s.y+45},comodo:s.comodo,aberto:true,modo:receitaPara(s.id,item.id)?.modoResultado??1,trava:null}]);
  }
  if(s.prontoEm&&a.tipo==='tocar')return negar();
  if(a.tipo==='tocar'&&mao){
   if(s.id==='fogao'&&mao.id==='panela'&&!s.itens.includes('panela'))return alterar([{...s,itens:[...s.itens,mao.id]},{...mao,local:'consumido',trava:null,aberto:true}]);
   const receita=receitaPara(s.id,mao.id);
   if(receita&&mao.modo===0&&(!receita.requer||s.itens.includes(receita.requer)))return alterar([{...s,ligado:true,itens:[...s.itens,mao.id],prontoEm:a.agora+receita.tempo},{...mao,local:'consumido',trava:null,aberto:true}]);
  }
 }
 if(d.funcao==='lavar'&&a.tipo==='tocar'&&mao?.id==='prato')return alterar([{...s,ligado:true},{...mao,modo:1}]);



 if(a.tipo==='acao2'&&['tapete','estrelas','banheira'].includes(d.funcao)){if(a.versao!==s.versao)return negar();return {...alterar([{...s,modo:2,...(d.funcao==='estrelas'?{ligado:false}:{})}]),efeitos:[{tipo:'particulas',nome:'brilho'}]}}
 if(d.funcao==='plantar'&&a.tipo==='tocar'){
  if(!s.aberto&&mao?.id==='sementes')return alterar([{...s,aberto:true,modo:0},{...mao,local:'consumido',trava:null,aberto:true}]);
  if(!s.aberto)return negar();return alterar([{...s,ligado:!s.ligado}]);
 }
 if(d.funcao==='regar'&&a.tipo==='tocar'){
  const canteiro=estados.find(e=>e.id==='canteiro')!;
  return {...alterar([{...s,ligado:!s.ligado},...(canteiro.aberto?[{...canteiro,modo:Math.min(2,canteiro.modo+1)}]:[])]),efeitos:[{tipo:'particulas',nome:'gotas'}]};
 }
 if(d.funcao==='pendurar'&&a.tipo==='guardar'&&(!mao||mao.id!=='roupa-suja'||mao.modo!==1))return negar();
 if(d.funcao==='adulto'&&a.tipo==='tocar'){
  const adulto=COMODOS.find(c=>c.id===s.comodo)?.adulto;
  if(!adulto||Math.hypot(adulto.x-s.x,adulto.y-s.y)>250)return negar();
 }
 if(d.funcao==='escovar'&&a.tipo==='tocar'&&mao?.id==='escova')return {...alterar([{...s,ligado:true},{...mao,modo:1}]),efeitos:[{tipo:'particulas',nome:'bolhas'},{tipo:'particulas',nome:'brilho'}]};
 if(d.funcao==='privacidade'&&(a.tipo==='tocar'||a.tipo==='levantar')){
  const r=aplicarNoMundo(estados,a,CATALOGO_CASA);if(!r.aceita)return r;
  return {...r,estados:r.estados.map(e=>e.id===s.id?{...e,aberto:e.ocupantes.length>0}:e),efeitos:[...r.efeitos,{tipo:'particulas',nome:a.tipo==='levantar'?'gotas':'brilho'}]};
 }
 if(d.funcao==='banheira'&&a.tipo==='tocar'&&s.ocupantes.some(o=>daInstancia(o,a.jogador,a.instancia)))return alterar([{...s,ocupantes:s.ocupantes.filter(o=>!daInstancia(o,a.jogador,a.instancia)),noite:false}]);
 if(s.tipo==='recipiente'||d.funcao==='escrever'){
  if((a.tipo==='retirar'||a.tipo==='guardar')&&a.item){
   if(!s.aberto||a.versao!==s.versao)return negar();const item=estados.find(e=>e.id===a.item);if(!item||item.tipo!=='pegavel')return negar();
   if(a.tipo==='guardar'){
    if(inv.mao!==item.id||s.itens.length>=6)return negar();
    const r={...item,versao:item.versao+1,local:'consumido' as const,trava:null,aberto:false,comodo:s.comodo};
    return {aceita:true,estados:estados.map(e=>e.id===s.id?{...s,itens:[...s.itens,item.id],versao:s.versao+1}:e.id===item.id?r:e),efeitos:[{tipo:'particulas',nome:'brilho'}]};
   }
   if(!s.itens.includes(item.id)||item.local!=='consumido'||item.aberto)return negar();
   const livres=estados.map(e=>e.id===item.id?{...item,local:'chao' as const}:e);
   const r=aplicarNoMundo(livres,{...a,tipo:'pegar',versao:item.versao,definicao:CATALOGO_CASA.find(d=>d.id===item.id)!},CATALOGO_CASA);
   if(!r.aceita)return negar();return {...r,estados:r.estados.map(e=>e.id===s.id?{...s,versao:s.versao+1,itens:s.itens.filter(id=>id!==item.id)}:e.id===item.id?{...e,aberto:true}:e)};
  }
 }
 if(a.tipo==='arrumar'){
  if(a.versao!==s.versao)return negar();const iniciais=estadosIniciaisCasa();
  return {aceita:true,estados:iniciais.map(i=>({...i,versao:(estados.find(e=>e.id===i.id)?.versao??0)+1})),efeitos:[{tipo:'particulas',nome:'coracoes'}]};
 }
 let r=aplicarNoMundo(estados,a,CATALOGO_CASA);
 if(!r.aceita)return r;
 if(a.tipo==='soltar')r={...r,estados:r.estados.map(e=>e.id===s.id?{...e,comodo:a.comodo??e.comodo}:e)};
 if(d.funcao==='escrever'&&a.tipo==='tocar')r={...r,estados:r.estados.map(e=>e.id===s.id?{...e,aberto:true}:e)};
 return r;
}
export function estaArrumada(estados:EstadoObjeto[]):boolean{
 const iniciais=estadosIniciaisCasa();return iniciais.every(i=>{const s=estados.find(s=>s.id===i.id);return s&&s.local===i.local&&s.comodo===i.comodo&&s.x===i.x&&s.y===i.y&&!s.trava&&s.ocupantes.length===0});
}
export function objetosDoComodo(estados:EstadoObjeto[],comodo:string,agora:number):EstadoObjeto[]{return estados.map(s=>estadoEfetivo(s,agora)).filter(s=>s.comodo===comodo&&s.local==='chao')}
export function origemCasa(id:string):{x:number;y:number;comodo:string}|undefined{for(const c of COMODOS){const o=c.objetos.find(o=>o.id===id);if(o)return{x:o.x,y:o.y,comodo:c.id}}}
