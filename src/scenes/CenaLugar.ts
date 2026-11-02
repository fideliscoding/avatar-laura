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
  constructor(chave: string,lugar: string){super(chave);this.lugar=lugar}
  create():void {
    this.x=640;this.y=570;this.tx=640;this.ty=570;this.chegada=undefined;this.destinos=[];
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
    const g=this.add.graphics().setDepth(-10);
    g.fillStyle(0xf0e6ff);g.fillRect(0,0,1280,430);g.fillStyle(0xe6cfb2);g.fillRect(0,430,1280,290);
    g.lineStyle(2,0xd6b898);for(let x=0;x<1280;x+=100)g.lineBetween(x,430,x,720);for(let y=470;y<720;y+=70)g.lineBetween(0,y,1280,y);
    g.fillStyle(0xffffff);g.fillRoundedRect(330,70,620,180,30);g.lineStyle(6,CORES.lilas);g.strokeRoundedRect(330,70,620,180,30);
    this.add.text(640,130,this.lugar,{fontFamily:FONTE,fontSize:'54px',color:CORES.textoRoxo,fontStyle:'700'}).setOrigin(.5);
    if(this.lugar===T.padaria){
      g.fillStyle(0xc59b71);g.fillRoundedRect(350,350,580,130,22);g.fillStyle(0xf9d69a);g.fillRoundedRect(340,330,600,40,16);
      for(let i=0;i<5;i++){g.fillStyle(0xe7ad60);g.fillEllipse(410+i*110,320,88,48);g.lineStyle(3,0xffe7b5);for(let j=0;j<3;j++)g.lineBetween(390+i*110+j*14,302,382+i*110+j*14,327)}
      this.pessoa(g,640,325);this.rotulo(640,300,T.padeira);
    } else if(this.lugar===T.pet){
      g.fillStyle(0xe7bceb);g.fillRoundedRect(420,370,440,150,55);
      g.fillStyle(0xb77a45);g.fillEllipse(640,415,150,100);g.fillCircle(680,365,58);g.fillStyle(0x7b4c34);g.fillEllipse(631,355,35,65);g.fillEllipse(725,355,35,65);
      g.fillStyle(0x392e36);g.fillCircle(662,361,6);g.fillCircle(698,361,6);g.fillEllipse(681,383,18,13);
      g.lineStyle(12,0xb77a45);g.strokeCircle(567,394,24);
      g.fillStyle(0x8cc6e8);g.fillEllipse(480,510,100,42);g.fillStyle(0xc6f5ff);g.fillEllipse(480,503,80,21);
      g.fillStyle(0xf3be88);g.fillEllipse(800,510,100,42);g.fillStyle(0x9a663d);for(let i=0;i<8;i++)g.fillCircle(777+(i%4)*15,500+Math.floor(i/4)*8,7);
      this.rotulo(640,280,T.bolinha);
    } else {g.fillStyle(0xb58cf5);g.fillRoundedRect(420,340,440,130,22);g.fillStyle(0xffe1ef);g.fillRoundedRect(430,325,420,65,20);this.rotulo(640,275,T.emBreve)}
    for(const [i,missao] of MISSOES.filter(m=>m.lugar===this.lugar).entries())this.destinos.push({nome:missao.titulo,x:620+i*70,y:550,acao:()=>abrirPainelMissao(this,missao.id)});
    this.add.zone(350,250,580,260).setOrigin(0).setInteractive().on('pointerdown',(_p:unknown,_x:unknown,_y:unknown,ev:Phaser.Types.Input.EventData)=>{ev.stopPropagation();if(this.destinos[0])this.ir(this.destinos[0])});
  }
  protected pessoa(g:Phaser.GameObjects.Graphics,x:number,y:number):void {
    g.fillStyle(0x8b55e6);g.fillRoundedRect(x-45,y-55,90,100,30);g.fillStyle(0xf2bd8b);g.fillCircle(x,y-85,42);g.fillStyle(0xffffff);g.fillEllipse(x,y-120,110,55);g.fillStyle(0x4a3144);g.fillCircle(x-13,y-85,4);g.fillCircle(x+13,y-85,4);
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
