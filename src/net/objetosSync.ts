import {amigos} from './sala';
import {daInstancia} from '../game/interacao/travas';
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
interface PedidoRede extends PedidoInteracao{id:string;instancia:string}
interface PendenteRede{pedido:PedidoRede;criado:number;enviado:number;resolver:(r:ConfirmacaoInteracao)=>void;efeitos:ConfirmacaoInteracao['efeitos']}
export function validarPedidoRede(valor:unknown):valor is PedidoRede{
 if(!valor||typeof valor!=='object')return false;const p=valor as PedidoRede;
 if(typeof p.id!=='string'||!/^[0-9a-f-]{36}$/.test(p.id)||typeof p.instancia!=='string'||!/^[0-9a-f-]{36}$/.test(p.instancia)||!CATALOGO_OBJETOS.some(d=>d.id===p.objeto)||!['tocar','pegar','soltar','guardar','retirar','comer','renovar','levantar','acao2','expirar'].includes(p.tipo)||!Number.isInteger(p.versao)||p.versao<0||p.versao>2147483647)return false;
 if(p.ponto!==undefined&&(!p.ponto||typeof p.ponto!=='object'||!Number.isFinite(p.ponto.x)||p.ponto.x<0||p.ponto.x>1280||!Number.isFinite(p.ponto.y)||p.ponto.y<0||p.ponto.y>720))return false;
 if(p.item!==undefined&&(typeof p.item!=='string'||!CATALOGO_OBJETOS.some(d=>d.id===p.item)))return false;
 if(p.mochila!==undefined&&typeof p.mochila!=='boolean')return false;
 if(p.snap!==undefined&&(!Number.isInteger(p.snap)||p.snap<0||p.snap>5))return false;
 if(p.ligado!==undefined&&typeof p.ligado!=='boolean')return false;
 if(p.mordidas!==undefined&&(!Number.isInteger(p.mordidas)||p.mordidas<0||p.mordidas>3))return false;
 return true;
}
export type SalaObjetos=Pick<typeof amigos,'usuario'|'sala'|'membros'|'fase'|'registrarInstanciaInteracao'|'instanciasInteracao'|'observarInteracoes'|'enviarInteracao'>;
export class ObjetosSync implements TransporteInteracao{
 readonly usuario:string;readonly instancia=crypto.randomUUID();
 private estados=OBJETOS_PARQUE.map(o=>criarEstado(definicaoObjeto(o.id),'Parque',o.x,o.y));
 private bases=new Map<string,number>();private pendentes=new Set<string>();private ouvintes=new Set<()=>void>();
 private ativa=true;private deslocamento=0;private fila:Promise<void>=Promise.resolve();private carregando=false;private emExecucao=false;
 private debounce?:ReturnType<typeof setTimeout>;private timer:ReturnType<typeof setInterval>;private timerInventario?:ReturnType<typeof setTimeout>;private ultimoInventario='';
 private pronta:Promise<void>;private donoAtual='';private compartilhado=false;private geracao=0;private ultimaLeitura=0;
 private pedidos=new Map<string,PendenteRede>();private processados=new Map<string,Promise<ConfirmacaoInteracao>>();private removerRede:()=>void;
 constructor(usuario:string|null,private arm:Armazenamento|null=armazenamento(),private sala:SalaObjetos=amigos){
  this.usuario=usuario??'local';this.donoAtual=this.usuario;ativos.add(this);this.carregarCache();
  this.sala.registrarInstanciaInteracao(this.instancia);
  this.removerRede=this.sala.observarInteracoes((autor,event,dados)=>{if(event==='pedido'){if(validarPedidoRede(dados))void this.processarRemoto(autor,dados)}else this.receberConfirmacao(autor,dados)});
  this.pronta=this.carregar();this.ultimaLeitura=Date.now();this.timer=setInterval(()=>this.pulso(),500);
 }
 get dono():string{return this.donoAtual}
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
  this.carregando=true;const geracao=this.geracao,dono=this.dono;
  try{const r=await supabase.rpc('ler_objetos',{p_dono:dono,p_lugar:'Parque'});if(!r.error&&geracao===this.geracao)this.receber(r.data)}catch{/* Retenta depois, sem publicar o cache como outra conta. */}
  finally{this.carregando=false}
 }
 pedir(p:PedidoInteracao):Promise<ConfirmacaoInteracao>{
  this.atualizarContexto();
  if(this.compartilhado)return this.pedirCompartilhado(p);
  const trabalho=this.fila.then(async()=>{await this.pronta;return this.executar(p)});
  this.fila=trabalho.then(()=>undefined,()=>undefined);return trabalho;
 }
 private negar(codigo:'mudou'|'ocupado'='mudou'):ConfirmacaoInteracao{return {aceita:false,estados:this.estados,efeitos:[{tipo:'fala',codigo}]}}
 private async executar(p:PedidoInteracao,jogador:string=this.usuario,instancia:string=this.instancia):Promise<ConfirmacaoInteracao>{
  if(!this.ativa||!CATALOGO_OBJETOS.some(d=>d.id===p.objeto))return this.negar();
  this.emExecucao=true;
  try{
   const atual=this.estados.find(s=>s.id===p.objeto)!;
   if(this.compartilhado){
    if(p.tipo==='comer'&&p.mordidas!==undefined&&atual.mordidas>p.mordidas)return {aceita:true,estados:this.estados,efeitos:[]};
    const pegando=['tocar','pegar','retirar'].includes(p.tipo)&&atual.tipo==='pegavel'&&atual.local==='mao'&&daInstancia(atual.trava,jogador,instancia);
    const sentado=p.tipo==='tocar'&&atual.ocupantes.some(o=>daInstancia(o,jogador,instancia));
    if(p.versao<atual.versao&&(pegando||sentado))return {aceita:true,estados:this.estados,efeitos:[]};
   }
   const r=aplicarNoMundo(this.estados,{...p,jogador,instancia,agora:this.agora(),definicao:definicaoObjeto(p.objeto)},CATALOGO_OBJETOS);
   if(!r.aceita)return r;
   const mudancas=r.estados.filter(s=>s.versao!==(this.estados.find(a=>a.id===s.id)?.versao??0));
   const critico=this.compartilhado||mudancas.some(s=>['pegavel','assento','cama'].includes(s.tipo));
   if(supabase&&this.usuario!=='local'&&critico){
    try{await this.gravar(mudancas);return {...r,estados:this.estados}}
    catch(erro){if(this.compartilhado||(erro instanceof FalhaObjeto&&erro.codigo)){for(const s of mudancas)this.pendentes.delete(s.id);await this.carregar();return this.negar()} }
   }
   if(!this.ativa)return this.negar();
   this.estados=r.estados;for(const s of mudancas)this.pendentes.add(s.id);this.avisar();
   clearTimeout(this.debounce);this.debounce=setTimeout(()=>{void this.gravarPendentes()},1000);
   return r;
  }finally{this.emExecucao=false}
 }
 private async gravar(mudancas:EstadoObjeto[]):Promise<void>{
  if(!supabase||!this.ativa||this.usuario==='local')return;
  if(this.dono!==this.usuario)throw new FalhaObjeto('somente-dono');
  const lote=mudancas.filter(s=>s.versao>(this.bases.get(s.id)??0)).map(s=>({id:s.id,base:this.bases.get(s.id)??0,estado:estadoEfetivo(s,this.agora())}));
  if(!lote.length)throw new FalhaObjeto('40001');
  const r=await supabase.rpc('guardar_objetos',{p_lugar:'Parque',p_estados:lote as unknown as Json});
  if(r.error)throw new FalhaObjeto(r.error.code??'');if(!this.receber(r.data))throw new FalhaObjeto('resposta-invalida');
 }
 private async gravarPendentes():Promise<void>{
  if(!this.ativa||this.emExecucao||!this.pendentes.size||!supabase||this.usuario==='local'||this.dono!==this.usuario||this.compartilhado&&!this.souAutoridade())return;
  this.emExecucao=true;
  try{await this.gravar(this.estados.filter(s=>this.pendentes.has(s.id)))}catch(erro){if(erro instanceof FalhaObjeto&&erro.codigo){this.pendentes.clear();await this.carregar()}}finally{this.emExecucao=false}
 }
 private atualizarContexto():void{
  const sala=this.sala.usuario===this.usuario?this.sala.sala:null;
  const aprovado=!!sala&&(sala.dono_id===this.usuario||this.sala.membros.some(m=>m.user_id===this.usuario&&m.aprovado));
  this.compartilhado=aprovado;
  const dono=aprovado?sala!.dono_id:this.usuario;
  if(dono===this.donoAtual)return;
  this.cache();this.donoAtual=dono;this.geracao++;this.bases.clear();this.pendentes.clear();this.processados.clear();
  for(const p of this.pedidos.values())p.resolver(this.negar());this.pedidos.clear();
  this.estados=OBJETOS_PARQUE.map(o=>criarEstado(definicaoObjeto(o.id),'Parque',o.x,o.y));this.carregarCache();
  this.pronta=this.carregar();this.ultimoInventario='';this.avisar();
 }
 private souAutoridade():boolean{
  if(this.dono!==this.usuario)return false;
  return !this.compartilhado||this.sala.fase==='conectado'&&this.sala.instanciasInteracao(this.usuario)[0]===this.instancia;
 }
 private pulso():void{
  if(!this.ativa)return;this.atualizarContexto();const agora=Date.now();
  for(const [id,p] of this.pedidos){
   if(agora-p.criado>6000){this.pedidos.delete(id);p.resolver(this.negar());continue}
   if(agora-p.enviado>=1000)this.enviarPedido(p);
  }
  if(!this.emExecucao&&agora-this.ultimaLeitura>2000){this.ultimaLeitura=agora;void this.carregar().then(()=>this.gravarPendentes())}
 }
 private pedirCompartilhado(p:PedidoInteracao):Promise<ConfirmacaoInteracao>{
  if(!this.ativa||this.sala.fase!=='conectado')return Promise.resolve(this.negar());
  const pedido:PedidoRede={...p,id:crypto.randomUUID(),instancia:this.instancia};
  const previa=aplicarNoMundo(this.estados,{...p,jogador:this.usuario,instancia:this.instancia,agora:this.agora(),definicao:definicaoObjeto(p.objeto)},CATALOGO_OBJETOS);
  return new Promise(resolve=>{const pendente:PendenteRede={pedido,criado:Date.now(),enviado:0,resolver:resolve,efeitos:previa.aceita?previa.efeitos:[]};this.pedidos.set(pedido.id,pendente);this.enviarPedido(pendente)});
 }
 private enviarPedido(p:PendenteRede):void{
  p.enviado=Date.now();this.sala.enviarInteracao('pedido',p.pedido);if(this.souAutoridade())void this.processarRemoto(this.usuario,p.pedido);
 }
 private async processarRemoto(autor:string,p:PedidoRede):Promise<void>{
  if(!this.ativa||!this.compartilhado||!this.souAutoridade()||!this.sala.membros.some(m=>m.user_id===autor&&m.aprovado))return;
  const chave=`${autor}:${p.instancia}:${p.id}`,geracao=this.geracao;
  let trabalho=this.processados.get(chave);
  if(!trabalho){
   trabalho=this.fila.then(async()=>{await this.pronta;await this.gravarPendentes();return this.executar(p,autor,p.instancia)});this.fila=trabalho.then(()=>undefined,()=>undefined);this.processados.set(chave,trabalho);
   if(this.processados.size>256)this.processados.delete(this.processados.keys().next().value!);
  }
  const r=await trabalho;if(!this.ativa||geracao!==this.geracao)return;
  const quadro={pedido:p.id,instancia:p.instancia,aceita:r.aceita,estados:this.estados,agora:this.agora()};
  this.sala.enviarInteracao('confirma',quadro);this.receberConfirmacao(this.usuario,quadro);
 }
 private receberConfirmacao(autor:string,valor:unknown):void{
  if(!this.ativa||!this.compartilhado||autor!==this.dono||!valor||typeof valor!=='object')return;
  const c=valor as {pedido?:unknown;instancia?:unknown;aceita?:unknown};
  if(typeof c.pedido!=='string'||typeof c.instancia!=='string'||typeof c.aceita!=='boolean'||!this.receber(valor))return;
  if(c.instancia!==this.instancia)return;const p=this.pedidos.get(c.pedido);if(!p)return;this.pedidos.delete(c.pedido);
  const atual=this.estados.find(s=>s.id===p.pedido.objeto);
  const ocupado=atual?.trava&&!daInstancia(atual.trava,this.usuario,this.instancia);
  const efeitos:ConfirmacaoInteracao['efeitos']=c.aceita?p.efeitos:[{tipo:'fala',codigo:ocupado?'ocupado':'mudou',jogador:ocupado?atual.trava!.jogador:undefined}];
  p.resolver({aceita:c.aceita,estados:this.estados,efeitos});
 }
 private programarInventario():void{
  if(!supabase||this.usuario==='local')return;const inv=inventarioDoMundo(this.estados,this.usuario,this.instancia,this.agora()),texto=JSON.stringify(inv);if(texto===this.ultimoInventario)return;
  this.ultimoInventario=texto;clearTimeout(this.timerInventario);this.timerInventario=setTimeout(()=>{if(this.ativa)void supabase?.from('profiles').update({inventario:inv as unknown as Json}).eq('id',this.usuario).then(r=>{if(r.error)this.ultimoInventario=''},()=>{this.ultimoInventario=''})},1000);
 }
 encerrar():void{if(!this.ativa)return;this.removerRede();for(const p of this.pedidos.values())p.resolver(this.negar());this.pedidos.clear();this.cache();this.ativa=false;clearInterval(this.timer);clearTimeout(this.debounce);clearTimeout(this.timerInventario);this.ouvintes.clear();ativos.delete(this)}
}
