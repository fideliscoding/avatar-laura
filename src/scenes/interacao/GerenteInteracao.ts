import Phaser from 'phaser';
import {OBJETOS_PARQUE,definicaoObjeto} from '../../game/interacao/catalogo';
import {inventarioDoMundo} from '../../game/interacao/mundo';
import {daInstancia,estadoEfetivo} from '../../game/interacao/travas';
import type {ConfirmacaoInteracao,EstadoObjeto,PedidoInteracao,TransporteInteracao,PoseInteracao} from '../../game/interacao/tipos';
import {TEXTOS_INTERACAO as T} from '../../config/interacoes';
import {ObjetoInterativo} from './ObjetoInterativo';
import {Avatar} from './Avatar';
import {Efeitos} from './Efeitos';

interface AcoesCena {andar(x:number,y:number,acao:()=>void):void;pode():boolean;notificar(texto:string):void;sentar(x:number,y:number,virado:1|-1):void;nome(jogador:string):string|undefined;remotos():Map<string,Phaser.GameObjects.Image>}
export class GerenteInteracao {
 readonly objetos=new Map<string,ObjetoInterativo>();private efeitos:Efeitos;private ativa=true;private assentoDesejado=false;private comendoAte=0;private mordendo=false;private renovando=new Set<string>();private timer:ReturnType<typeof setInterval>;private ultimaAgua=0;
 constructor(private cena:Phaser.Scene,readonly avatar:Avatar,readonly transporte:TransporteInteracao,private acoes:AcoesCena){
  this.efeitos=new Efeitos(cena);
  for(const o of OBJETOS_PARQUE)this.objetos.set(o.id,new ObjetoInterativo(cena,definicaoObjeto(o.id),o.x,o.y,()=>this.interagir(o.id)));
  this.timer=setInterval(()=>this.renovar(),2000);
 }
 estados():EstadoObjeto[]{return this.transporte.ler().map(s=>estadoEfetivo(s,this.transporte.agora()))}
 inventario(){return inventarioDoMundo(this.estados(),this.transporte.usuario,this.transporte.instancia,this.transporte.agora())}
 interagir(id:string):void{
  if(!this.acoes.pode())return;const s=this.estados().find(s=>s.id===id);if(!s)return;const d=definicaoObjeto(id),o=this.objetos.get(id)!;this.efeitos.tocar(o.imagem);
  const snap=d.snaps?.find(p=>!s.ocupantes.some(o=>d.snaps?.[o.snap]===p));
  const x=s.x+(snap?.x??d.pontoUso[0]),y=s.y+(snap?.y??d.pontoUso[1]);
  this.acoes.andar(x,y+25,()=>{void this.solicitar(id,'tocar')});
 }
 async solicitar(objeto:string,tipo:PedidoInteracao['tipo'],ponto?:{x:number;y:number}):Promise<ConfirmacaoInteracao>{
  const s=this.transporte.ler().find(s=>s.id===objeto)!;
  const r=await this.transporte.pedir({objeto,tipo,versao:s.versao,ponto,mordidas:s.mordidas,ligado:s.tipo==='agua'||s.tipo==='aparelho'?!s.ligado:undefined});
  if(!this.ativa)return r;
  if(r.aceita&&['assento','cama'].includes(s.tipo)&&tipo==='tocar')this.assentoDesejado=true;
  for(const e of r.efeitos){
   if(e.tipo==='fala'){const nome=e.jogador?this.acoes.nome(e.jogador):undefined;this.acoes.notificar(e.codigo==='ocupado'&&nome?`Já está com ${nome}. Vamos esperar um pouquinho?`:e.codigo==='agua'?T.fresquinha:e.codigo==='sem-posse'?T.semPosse:T[e.codigo])}
   if(e.tipo==='particulas')this.efeitos.particulas(e.nome,this.avatar.imagem.x,this.avatar.imagem.y-60);
   if(e.tipo==='pose'&&e.pose==='comendo')this.comendoAte=this.cena.time.now+650;
  }
  return r;
 }
 comer():void{const id=this.inventario().mao;if(id&&!this.mordendo){this.mordendo=true;void this.solicitar(id,'comer').finally(()=>{this.mordendo=false})}}
 guardar():void{const id=this.inventario().mao;if(id)void this.solicitar(id,'guardar')}
 soltar(ponto?:{x:number;y:number}):void{const id=this.inventario().mao;if(id)void this.solicitar(id,'soltar',ponto??{x:this.avatar.imagem.x,y:this.avatar.imagem.y})}
 levantar():void{this.assentoDesejado=false;for(const s of this.estados())if(s.ocupantes.some(o=>daInstancia(o,this.transporte.usuario,this.transporte.instancia)))void this.solicitar(s.id,'levantar')}
 private renovar():void{
  for(const s of this.estados())if(daInstancia(s.trava,this.transporte.usuario,this.transporte.instancia)||s.ocupantes.some(o=>daInstancia(o,this.transporte.usuario,this.transporte.instancia))){
   if(this.renovando.has(s.id))continue;this.renovando.add(s.id);void this.solicitar(s.id,'renovar').finally(()=>this.renovando.delete(s.id));
  }
 }
 prepararAvatar():PoseInteracao{
  let pose:PoseInteracao=this.inventario().mao?'segurando':'em-pe';if(this.cena.time.now<this.comendoAte)pose='comendo';
  for(const s of this.estados()){
   const ocupado=s.ocupantes.find(o=>daInstancia(o,this.transporte.usuario,this.transporte.instancia));
   if(ocupado&&this.assentoDesejado){const snap=definicaoObjeto(s.id).snaps![ocupado.snap];this.acoes.sentar(s.x+snap.x,s.y+snap.y,snap.virado??1);pose=ocupado.dormindo?'dormindo':snap.pose==='deitado'?'deitado':'sentado'}
  }
  this.avatar.aplicarPose(pose);return pose;
 }
 atualizar():void{
  for(const s of this.estados()){
   const visual=this.objetos.get(s.id);if(!visual)continue;visual.desenhar(s);
   if(s.local==='mao'&&s.trava){
    const img=daInstancia(s.trava,this.transporte.usuario,this.transporte.instancia)?this.avatar.imagem:this.acoes.remotos().get(s.trava.jogador);
    if(img){const mao=new Avatar(img).mao();visual.imagem.setVisible(true).setPosition(mao.x,mao.y).setDepth(img.depth+1).setScale((s.mordidas===2?.6:s.mordidas===1?.8:1)*30/visual.imagem.width*(img.scaleX<0?-1:1),(s.mordidas===2?.6:s.mordidas===1?.8:1)*30/visual.imagem.width);}
   }
   if(s.tipo==='agua'&&s.ligado&&this.cena.time.now-this.ultimaAgua>400){this.ultimaAgua=this.cena.time.now;this.efeitos.particulas('gotas',s.x-5,s.y-75)}
  }
 }
 destruir():void{this.ativa=false;clearInterval(this.timer);this.transporte.encerrar();for(const o of this.objetos.values())o.destruir();this.objetos.clear()}
}
