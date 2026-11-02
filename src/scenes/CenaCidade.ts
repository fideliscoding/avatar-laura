import Phaser from 'phaser';
import { CenaLugar } from './CenaLugar';
import { TEXTOS_CIDADE as T } from '../config/cidade';

export class CenaCidade extends CenaLugar {
  constructor(){super('Cidade',T.mapa)}
  protected desenharLugar():void {
    const mapa=this.make.tilemap({key:'cidade'});const tiles=mapa.addTilesetImage('cidade-tiles','cidade-tiles');
    if(!tiles)throw new Error('Tileset da cidade não carregado.');mapa.createLayer('Chão',tiles)?.setDepth(-20);
    const portas=mapa.getObjectLayer('Portas');
    if(!portas)throw new Error('Portas da cidade não carregadas.');
    for(const porta of portas.objects){
      const x=porta.x??0,y=porta.y??0,w=porta.width??220,h=porta.height??135;
      const propriedades=porta.properties as {name:string;value:unknown}[]|undefined;
      const cena=propriedades?.find(p=>p.name==='cena')?.value;
      if(typeof cena!=='string'||!this.scene.manager.keys[cena])continue;
      const g=this.add.graphics();g.fillStyle(cena==='Padaria'?0xffd8ad:cena==='PetShop'?0xbce9df:0xe3d0ff);g.fillRoundedRect(x,y,w,h,18);
      g.fillStyle(0xb58cf5);g.fillTriangle(x-15,y+8,x+w/2,y-65,x+w+15,y+8);g.fillStyle(0xffffff);g.fillRoundedRect(x+w/2-25,y+h-75,50,75,14);
      g.fillStyle(0xffd23f);g.fillCircle(x+w/2+12,y+h-35,5);this.rotulo(x+w/2,y-20,porta.name??'',22);
      const destino={nome:cena==='Casa'?'Casa':porta.name??cena,x:x+w/2,y:y+h+12,acao:()=>this.scene.start(cena)};this.destinos.push(destino);
      this.add.zone(x,y-40,w,h+60).setOrigin(0).setInteractive().on('pointerdown',(_p:unknown,_x:unknown,_y:unknown,ev:Phaser.Types.Input.EventData)=>{ev.stopPropagation();this.ir(destino)});
    }
  }
}
