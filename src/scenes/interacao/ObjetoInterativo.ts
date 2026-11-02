import Phaser from 'phaser';
import type {DefinicaoObjeto,EstadoObjeto} from '../../game/interacao/tipos';
import {FONTE,TEXTURAS_INTERACAO} from '../../config/assets';
/** Sprite independente da zona: mesmo o sorvete pequeno tem toque de 64x64. */
export class ObjetoInterativo {
 readonly imagem:Phaser.GameObjects.Image;readonly zona:Phaser.GameObjects.Zone;
 private inicioToque=0;private aviso?:Phaser.Time.TimerEvent;
 constructor(cena:Phaser.Scene,readonly definicao:DefinicaoObjeto,x:number,y:number,aoTocar:()=>void){
  ObjetoInterativo.garantirTexturas(cena);
  this.imagem=cena.add.image(x,y,definicao.sprite.padrao??Object.values(definicao.sprite)[0]).setOrigin(...definicao.origem);
  const [ax,ay,w,h]=definicao.area;this.zona=cena.add.zone(x+ax,y+ay,Math.max(64,w),Math.max(64,h)).setOrigin(0).setInteractive({useHandCursor:true}).setDepth(y+2);
  this.zona.on('pointerdown',(_p:unknown,_x:unknown,_y:unknown,ev:Phaser.Types.Input.EventData)=>{
   ev.stopPropagation();this.inicioToque=cena.time.now;this.aviso=cena.time.delayedCall(500,()=>{
    const texto=cena.add.text(x,y-110,definicao.nome,{fontFamily:FONTE,fontSize:`${Math.max(22,22/cena.cameras.main.zoom)}px`,color:'#5a2fa8',backgroundColor:'#ffffff'}).setOrigin(.5).setDepth(7000);cena.time.delayedCall(1600,()=>texto.destroy());
   });
  });
  this.zona.on('pointerup',(_p:unknown,_x:unknown,_y:unknown,ev:Phaser.Types.Input.EventData)=>{ev.stopPropagation();this.aviso?.remove();if(cena.time.now-this.inicioToque<500)aoTocar()});
  this.zona.on('pointerout',()=>this.aviso?.remove());
 }
 desenhar(estado:EstadoObjeto):void{
  const d=this.definicao,chave=estado.mordidas>0?d.sprite[`mordida${estado.mordidas}`]:estado.ligado?d.sprite.ligado:estado.aberto?d.sprite.aberto:undefined;
  this.imagem.setTexture(chave??d.sprite.padrao??Object.values(d.sprite)[0]);this.imagem.setScale(d.largura/this.imagem.width*(this.imagem.getData('interacao-squash')??1)).setPosition(estado.x,estado.y).setDepth(estado.y);
  const chao=estado.local==='chao';this.imagem.setVisible(chao);this.zona.setVisible(chao);if(this.zona.input)this.zona.input.enabled=chao;
 }
 static garantirTexturas(cena:Phaser.Scene):void{
  for(const chave of TEXTURAS_INTERACAO){
   if(cena.textures.exists(chave))continue;const g=cena.make.graphics({},false);
   if(chave.includes('sorvete')){
    g.fillStyle(0xf1bc7e);g.fillTriangle(18,22,42,22,30,62);g.lineStyle(2,0xb9804b);g.strokeTriangle(18,22,42,22,30,62);
    const etapa=chave.endsWith('-2')?2:chave.endsWith('-1')?1:0;g.fillStyle(0xf6a8cf);g.fillCircle(30,20,etapa===2?8:etapa===1?11:15);g.lineStyle(2,0xa66a97);g.strokeCircle(30,20,etapa===2?8:etapa===1?11:15);g.generateTexture(chave,60,64);
   }else if(chave==='interacao-banco'){
    g.fillStyle(0x69438f);g.fillRoundedRect(26,75,10,25,4);g.fillRoundedRect(140,75,10,25,4);g.fillStyle(0xb58cf5);g.fillRoundedRect(5,10,170,60,10);g.fillStyle(0xd7b8f3);g.fillRoundedRect(0,70,180,15,6);g.lineStyle(3,0x8b55e6);g.strokeRoundedRect(5,10,170,60,10);g.generateTexture(chave,180,100);
   }else{
    g.fillStyle(0x88d5c5);g.fillRoundedRect(18,16,45,80,9);g.fillStyle(0xd2fff4);g.fillEllipse(40,20,65,25);g.lineStyle(5,0x7c8ca3);g.lineBetween(53,19,53,7);g.lineBetween(53,7,35,7);if(chave.endsWith('ligado')){g.lineStyle(3,0x8fcbed);g.lineBetween(35,9,35,26)}g.generateTexture(chave,80,100);
   }g.destroy();
  }
 }
 destruir():void{this.aviso?.remove();this.imagem.destroy();this.zona.destroy()}
}
