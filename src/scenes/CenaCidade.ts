import Phaser from 'phaser';
import { CenaLugar } from './CenaLugar';
import { TEXTOS_CIDADE as T } from '../config/cidade';

export class CenaCidade extends CenaLugar {
  constructor(){super('Cidade',T.mapa);this.pontoInicial={x:640,y:660}}
  protected desenharLugar():void {
    const mapa=this.make.tilemap({key:'cidade'});const tiles=mapa.addTilesetImage('cidade-tiles','cidade-tiles');
    if(!tiles)throw new Error('Tileset da cidade não carregado.');mapa.createLayer('Chão',tiles)?.setVisible(false);
    this.add.image(0,0,'cidade-ilustrada').setOrigin(0).setDisplaySize(1280,720).setDepth(-20);
    const portas=mapa.getObjectLayer('Portas');
    if(!portas)throw new Error('Portas da cidade não carregadas.');
    for(const porta of portas.objects){
      const x=porta.x??0,y=porta.y??0,w=porta.width??220,h=porta.height??135;
      const propriedades=porta.properties as {name:string;value:unknown}[]|undefined;
      const cena=propriedades?.find(p=>p.name==='cena')?.value;
      if(typeof cena!=='string'||!this.scene.manager.keys[cena])continue;
      const entradaX=propriedades?.find(p=>p.name==='entradaX')?.value;
      const entradaY=propriedades?.find(p=>p.name==='entradaY')?.value;
      const px=typeof entradaX==='number' && Number.isFinite(entradaX)?entradaX:x+w/2;
      const py=typeof entradaY==='number' && Number.isFinite(entradaY)?entradaY:y+h+12;
      this.rotulo(px,py+22,porta.name??'',20);
      const destino={nome:cena==='Casa'?'Casa':porta.name??cena,x:px,y:py,acao:()=>this.scene.start(cena)};this.destinos.push(destino);
      this.add.zone(x,y-40,w,h+60).setOrigin(0).setInteractive().on('pointerdown',(_p:unknown,_x:unknown,_y:unknown,ev:Phaser.Types.Input.EventData)=>{ev.stopPropagation();this.ir(destino)});
    }
  }
}
