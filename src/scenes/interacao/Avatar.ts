import Phaser from 'phaser';
import type {PoseInteracao} from '../../game/interacao/tipos';
/** Pontos normalizados dos PNGs frontais; a transformação preserva flip e rotação. */
export class Avatar {
 pose:PoseInteracao='em-pe';
 constructor(readonly imagem:Phaser.GameObjects.Image){}
 mao():{x:number;y:number}{
  const img=this.imagem,dx=(.27-img.originX)*img.width*img.scaleX,dy=(.70-img.originY)*img.height*img.scaleY,c=Math.cos(img.rotation),s=Math.sin(img.rotation);
  return {x:img.x+dx*c-dy*s,y:img.y+dx*s+dy*c};
 }
 aplicarPose(pose:PoseInteracao):void{
  this.pose=pose;
  if(pose==='deitado'||pose==='dormindo')this.imagem.setAngle(90);
 }
}
