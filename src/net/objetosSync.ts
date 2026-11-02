import {supabase} from './supabase';
import type {Json} from './banco.types';
import type {Armazenamento} from '../game/estado';
import {CATALOGO_OBJETOS,OBJETOS_PARQUE,definicaoObjeto,validarEstadoObjeto} from '../game/interacao/catalogo';
import {criarEstado} from '../game/interacao/regras';
import {aplicarNoMundo,inventarioDoMundo} from '../game/interacao/mundo';
import {estadoEfetivo} from '../game/interacao/travas';
import type {ConfirmacaoInteracao,EstadoObjeto,PedidoInteracao,TransporteInteracao} from '../game/interacao/tipos';
const ativos=new Set<ObjetosSync>();
export function encerrarObjetos():void{for(const s of [...ativos])s.encerrar()}
function armazenamento():Armazenamento|null{try{return localStorage}catch{return null}}
class FalhaObjeto extends Error{constructor(readonly codigo:string){super('Não foi possível confirmar o objeto.')}}
interface Quadro{estados:EstadoObjeto[];agora:number}
export function validarQuadro(valor:unknown):Quadro|null{
 if(!valor||typeof valor!=='object')return null;const q=valor as Quadro;
 if(!Array.isArray(q.estados)||q.estados.length>32||!Number.isFinite(q.agora))return null;
 const estados:EstadoObjeto[]=[];
 for(const s of q.estados){const d=CATALOGO_OBJETOS.find(d=>d.id===s?.id);if(!d)continue;if(!validarEstadoObjeto(s,d))return null;estados.push(s)}
 if(new Set(estados.map(s=>s.id)).size!==estados.length)return null;return {estados,agora:q.agora};
}
/** Cache segregado por dono. Leases são confirmados imediatamente; alterações livres usam debounce. */
export class ObjetosSync implements TransporteInteracao{
 readonly usuario:string;readonly instancia=crypto.randomUUID();
 private estados=OBJETOS_PARQUE.map(o=>criarEstado(definicaoObjeto(o.id),'Parque',o.x,o.y));
 private bases=new Map<string,number>();private pendentes=new Set<string>();private ouvintes=new Set<()=>void>();
 private ativa=true;private deslocamento=0;private fila:Promise<void>=Promise.resolve();private carregando=false;private emExecucao=false;
 private debounce?:ReturnType<typeof setTimeout>;private timer:ReturnType<typeof setInterval>;private timerInventario?:ReturnType<typeof setTimeout>;private ultimoInventario='';
 private pronta:Promise<void>;
 constructor(usuario:string|null,private arm:Armazenamento|null=armazenamento()){
  this.usuario=usuario??'local';ativos.add(this);this.carregarCache();
  this.pronta=this.carregar();this.timer=setInterval(()=>{if(!this.emExecucao){void this.carregar().then(()=>this.gravarPendentes())}},2000);
 }
 get dono():string{return this.usuario}
 private get chave():string{return `mtmw:objetos:v1:${this.dono}:Parque:${this.usuario}`}
 agora():number{return Date.now()+this.deslocamento}
 ler():EstadoObjeto[]{return this.estados}
 observar(fn:()=>void):()=>void{this.ouvintes.add(fn);return()=>this.ouvintes.delete(fn)}
 private avisar():void{if(!this.ativa)return;this.cache();for(const fn of this.ouvintes)fn();this.programarInventario()}
 private carregarCache():void{
  try{
   const cache=JSON.parse(this.arm?.getItem(this.chave)??'null') as {estados?:unknown[];bases?:Record<string,number>;pendentes?:string[]}|null;
   if(!cache||!Array.isArray(cache.estados))return;
   for(const valor of cache.estados){const d=CATALOGO_OBJETOS.find(d=>d.id===(valor as EstadoObjeto)?.id);if(d&&validarEstadoObjeto(valor,d)){this.estados=this.estados.map(s=>s.id===d.id?valor:s);this.bases.set(d.id,Number.isInteger(cache.bases?.[d.id])?cache.bases![d.id]:0)}}
   for(const id of cache.pendentes??[])if(CATALOGO_OBJETOS.some(d=>d.id===id))this.pendentes.add(id);
  }catch{/* Cache inválido não altera os estados do catálogo. */}
 }
 private cache():void{try{this.arm?.setItem(this.chave,JSON.stringify({estados:this.estados,bases:Object.fromEntries(this.bases),pendentes:[...this.pendentes]}))}catch{/* A sessão continua em memória. */}}
 private receber(valor:unknown):boolean{
  const q=validarQuadro(valor);if(!q||!this.ativa)return false;this.deslocamento=q.agora-Date.now();
  for(const s of q.estados){
   const base=this.bases.get(s.id)??0;if(s.versao<base)continue;
   const local=this.estados.find(e=>e.id===s.id)!;
   if(this.pendentes.has(s.id)&&local.versao>s.versao&&base===s.versao)continue;
   this.bases.set(s.id,s.versao);this.pendentes.delete(s.id);this.estados=this.estados.map(e=>e.id===s.id?s:e);
  }
  this.avisar();return true;
 }
 private async carregar():Promise<void>{
  if(!this.ativa||this.carregando||!supabase||this.usuario==='local')return;
  this.carregando=true;
  try{const r=await supabase.rpc('ler_objetos',{p_dono:this.dono,p_lugar:'Parque'});if(!r.error)this.receber(r.data)}catch{/* Retenta depois, sem publicar o cache como outra conta. */}
  finally{this.carregando=false}
 }
 pedir(p:PedidoInteracao):Promise<ConfirmacaoInteracao>{
  const trabalho=this.fila.then(async()=>{await this.pronta;return this.executar(p)});
  this.fila=trabalho.then(()=>undefined,()=>undefined);return trabalho;
 }
 private negar(codigo:'mudou'|'ocupado'='mudou'):ConfirmacaoInteracao{return {aceita:false,estados:this.estados,efeitos:[{tipo:'fala',codigo}]}}
 private async executar(p:PedidoInteracao):Promise<ConfirmacaoInteracao>{
  if(!this.ativa||!CATALOGO_OBJETOS.some(d=>d.id===p.objeto))return this.negar();
  this.emExecucao=true;
  try{
   const r=aplicarNoMundo(this.estados,{...p,jogador:this.usuario,instancia:this.instancia,agora:this.agora(),definicao:definicaoObjeto(p.objeto)},CATALOGO_OBJETOS);
   if(!r.aceita)return r;
   const mudancas=r.estados.filter(s=>s.versao!==(this.estados.find(a=>a.id===s.id)?.versao??0));
   const critico=mudancas.some(s=>['pegavel','assento','cama'].includes(s.tipo));
   if(supabase&&this.usuario!=='local'&&critico){
    try{await this.gravar(mudancas);return {...r,estados:this.estados}}
    catch(erro){if(erro instanceof FalhaObjeto&&erro.codigo){for(const s of mudancas)this.pendentes.delete(s.id);await this.carregar();return this.negar()} }
   }
   if(!this.ativa)return this.negar();
   this.estados=r.estados;for(const s of mudancas)this.pendentes.add(s.id);this.avisar();
   clearTimeout(this.debounce);this.debounce=setTimeout(()=>{void this.gravarPendentes()},1000);
   return r;
  }finally{this.emExecucao=false}
 }
 private async gravar(mudancas:EstadoObjeto[]):Promise<void>{
  if(!supabase||!this.ativa||this.usuario==='local')return;
  const lote=mudancas.filter(s=>s.versao>(this.bases.get(s.id)??0)).map(s=>({id:s.id,base:this.bases.get(s.id)??0,estado:estadoEfetivo(s,this.agora())}));
  if(!lote.length)throw new FalhaObjeto('40001');
  const r=await supabase.rpc('guardar_objetos',{p_lugar:'Parque',p_estados:lote as unknown as Json});
  if(r.error)throw new FalhaObjeto(r.error.code??'');if(!this.receber(r.data))throw new FalhaObjeto('resposta-invalida');
 }
 private async gravarPendentes():Promise<void>{
  if(!this.ativa||this.emExecucao||!this.pendentes.size||!supabase||this.usuario==='local')return;
  this.emExecucao=true;
  try{await this.gravar(this.estados.filter(s=>this.pendentes.has(s.id)))}catch(erro){if(erro instanceof FalhaObjeto&&erro.codigo){this.pendentes.clear();await this.carregar()}}finally{this.emExecucao=false}
 }
 private programarInventario():void{
  if(!supabase||this.usuario==='local')return;const inv=inventarioDoMundo(this.estados,this.usuario,this.instancia,this.agora()),texto=JSON.stringify(inv);if(texto===this.ultimoInventario)return;
  this.ultimoInventario=texto;clearTimeout(this.timerInventario);this.timerInventario=setTimeout(()=>{if(this.ativa)void supabase?.from('profiles').update({inventario:inv as unknown as Json}).eq('id',this.usuario).then(r=>{if(r.error)this.ultimoInventario=''},()=>{this.ultimoInventario=''})},1000);
 }
 encerrar():void{if(!this.ativa)return;this.cache();this.ativa=false;clearInterval(this.timer);clearTimeout(this.debounce);clearTimeout(this.timerInventario);this.ouvintes.clear();ativos.delete(this)}
}
