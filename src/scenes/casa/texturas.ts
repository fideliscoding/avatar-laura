import type Phaser from 'phaser';
import {TEXTURAS_CASA} from '../../config/assets';
import {CATALOGO_CASA} from '../../game/casa/catalogo';
/** Móveis provisórios independentes; rótulos e estados ficam fora da textura. */
export function criarTexturasCasa(cena:Phaser.Scene):void{
 for(const d of CATALOGO_CASA){const chave=d.sprite.padrao;if(!TEXTURAS_CASA.includes(chave)||cena.textures.exists(chave))continue;const g=cena.make.graphics({},false);
  g.fillStyle(0xb58cf5);g.lineStyle(4,0x8b55e6);g.fillRoundedRect(8,8,164,104,14);g.strokeRoundedRect(8,8,164,104,14);
  if(d.tipo==='assento'||d.tipo==='cama'){g.fillStyle(0xe5caff);g.fillRoundedRect(2,66,176,35,10);g.fillStyle(0x69438f);g.fillRect(18,102,12,18);g.fillRect(150,102,12,18)}
  else if(d.tipo==='pegavel'){g.clear();g.fillStyle(0xf27ab3);g.fillCircle(90,60,45);g.lineStyle(5,0x8b55e6);g.strokeCircle(90,60,45)}
  else if(d.tipo==='agua'){g.fillStyle(0x9ce8df);g.fillEllipse(90,45,130,45);g.lineStyle(8,0x7d80a0);g.lineBetween(125,35,125,15);g.lineBetween(125,15,92,15)}
  else{g.lineStyle(4,0xf8ecff);g.strokeRoundedRect(25,23,130,70,8);g.fillStyle(0xf27ab3);g.fillCircle(145,58,7)}
  g.generateTexture(chave,180,120);g.destroy();
 }
}
