import Phaser from 'phaser';
import { CABELOS, CORES, FONTE } from '../config/assets';
import { TEXTOS_CIDADE as T } from '../config/cidade';
import { progresso } from '../game/estado';
import { MISSOES } from '../game/missoes/catalogo';
import { AvatarAnimado } from '../ui/AvatarAnimado';
import { abrirPainelMissao } from './CenaMissao';

export interface DestinoLugar { nome: string; x: number; y: number; acao:()=>void }
/** Mundo lógico dos novos lugares; a interface fica em outra cena em pixels visíveis. */
export class CenaLugar extends Phaser.Scene {
  protected lugar: string;
  protected avatar!: Phaser.GameObjects.Image;
  private animador!: AvatarAnimado;
  private x=640;private y=570;private tx=640;private ty=570;private chegada?:()=>void;
  protected destinos: DestinoLugar[]=[];
  protected pontoInicial={x:640,y:570};
  constructor(chave: string,lugar: string){super(chave);this.lugar=lugar}
  create():void {
    this.x=this.pontoInicial.x;this.y=this.pontoInicial.y;this.tx=this.x;this.ty=this.y;this.chegada=undefined;this.destinos=[];
    this.desenharLugar();
    this.avatar=this.add.image(this.x,this.y,CABELOS[progresso.cabelo].key).setOrigin(.5,1);
    this.avatar.setScale(Math.min(107/this.avatar.width,172/this.avatar.height));
    this.animador=new AvatarAnimado(this.avatar);
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{const ponto=this.cameras.main.getWorldPoint(p.x,p.y);this.andar(ponto.x,ponto.y)});
    this.ajustarCamera();this.scale.on('resize',this.ajustarCamera,this);
    this.scene.launch('LugarInterface',{lugar:this});
    this.events.once('shutdown',()=>{this.scale.off('resize',this.ajustarCamera,this);this.input.removeAllListeners('pointerdown');this.scene.stop('LugarInterface')});
  }
  protected desenharLugar():void {
    const chave=this.lugar===T.padaria?'padaria-cenario':this.lugar===T.pet?'pet-cenario':'casa-cenario';
    this.add.image(0,0,chave).setOrigin(0).setDisplaySize(1280,720).setDepth(-20);
    if(this.lugar===T.padaria){
      const padeira=this.add.image(640,450,'dona-rosa').setOrigin(.5,1).setDepth(300);
      padeira.setScale(280/padeira.height).setCrop(0,0,padeira.width,padeira.height*.64);
      this.rotulo(640,145,T.padeira,22);
    } else if(this.lugar===T.pet){
      const bolinha=this.add.image(645,445,'bolinha').setOrigin(.5,1).setDepth(300);bolinha.setScale(145/bolinha.height);
      this.tweens.add({targets:bolinha,angle:2,duration:1400,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      this.rotulo(645,270,T.bolinha,22);
    } else this.rotulo(640,220,T.emBreve,22);
    for(const [i,missao] of MISSOES.filter(m=>m.lugar===this.lugar).entries())this.destinos.push({nome:missao.titulo,x:620+i*70,y:550,acao:()=>abrirPainelMissao(this,missao.id)});
    this.add.zone(350,250,580,260).setOrigin(0).setInteractive().on('pointerdown',(_p:unknown,_x:unknown,_y:unknown,ev:Phaser.Types.Input.EventData)=>{ev.stopPropagation();if(this.destinos[0])this.ir(this.destinos[0])});
  }
  protected rotulo(x:number,y:number,texto:string,tamanho=28):void {this.add.text(x,y,texto,{fontFamily:FONTE,fontSize:`${tamanho}px`,color:CORES.textoRoxo,backgroundColor:'#ffffff',padding:{x:12,y:8}}).setOrigin(.5)}
  private ajustarCamera():void {
    const w=this.scale.width,h=this.scale.height;this.cameras.main.setViewport(0,88,w,Math.max(100,h-176)).setBounds(0,0,1280,720).setZoom(Math.max(.65,w/1280,(h-176)/720)).startFollow(this.avatar,true,.16,.16,0,45);
  }
  titulo():string {return this.lugar}
  acoes():DestinoLugar[]{return this.destinos}
  ir(destino:DestinoLugar):void {this.andar(destino.x,destino.y,destino.acao)}
  private andar(x:number,y:number,chegada?:()=>void):void {this.tx=Phaser.Math.Clamp(x,35,1245);this.ty=Phaser.Math.Clamp(y,220,700);this.chegada=chegada}
  update(time:number,delta:number):void {
    const dx=this.tx-this.x,dy=this.ty-this.y,d=Math.hypot(dx,dy),andando=d>3;
    if(andando){const passo=Math.min(d,230*Math.min(.05,delta/1000));this.x+=dx/d*passo;this.y+=dy/d*passo;this.avatar.setFlipX(false).setScale(Math.abs(this.avatar.scaleX)*(dx<0?-1:1),this.avatar.scaleY)}
    else if(this.chegada){const acao=this.chegada;this.chegada=undefined;acao();if(!this.scene.isActive())return}
    this.avatar.setPosition(this.x,this.y-(andando?Math.abs(Math.sin(time*.011))*5:0)).setDepth(this.y);
    this.animador.atualizar(andando?'andar':'parada',time/1000);
  }
}
