import Phaser from 'phaser';
import type {EfeitoInteracao} from '../../game/interacao/tipos';
/** Feedback desenhado: não exige arquivos de áudio nem sprites extras. */
export class Efeitos {
 constructor(private cena:Phaser.Scene){}
 tocar(imagem:Phaser.GameObjects.Image):void{this.cena.tweens.addCounter({from:0,to:1,duration:240,onUpdate:t=>imagem.setData('interacao-squash',1+Math.sin(t.getValue()!*Math.PI)*.08),onComplete:()=>imagem.setData('interacao-squash',1)})}
 particulas(nome:Extract<EfeitoInteracao,{tipo:'particulas'}>['nome'],x:number,y:number):void{
  for(let i=0;i<8;i++){
   const g=this.cena.add.graphics().setPosition(x+(i-4)*4,y).setDepth(y+100);
   if(nome==='gotas'||nome==='bolhas'||nome==='vapor'){g.fillStyle(nome==='vapor'?0xffffff:0x84c9ef,.8);g.fillEllipse(0,0,6,10)}
   else if(nome==='coracoes'){g.fillStyle(0xf27ab3);g.fillCircle(-3,0,4);g.fillCircle(3,0,4);g.fillTriangle(-7,1,7,1,0,10)}
   else if(nome==='notas'){g.fillStyle(0x8b55e6).fillEllipse(-2,5,8,6);g.lineStyle(3,0x8b55e6).lineBetween(2,5,2,-10).lineBetween(2,-10,9,-6)}
   else if(nome==='sono'){g.lineStyle(3,0xb58cf5);g.lineBetween(-6,-5,6,-5);g.lineBetween(6,-5,-6,5);g.lineBetween(-6,5,6,5)}
   else {g.fillStyle(nome==='migalhas'?0xf0c38a:0xffd23f);g.fillCircle(0,0,3)}
   this.cena.tweens.add({targets:g,x:g.x+(i-4)*7,y:y+(nome==='gotas'?40:-45),alpha:0,duration:600+i*30,onComplete:()=>g.destroy()});
  }
 }
}
