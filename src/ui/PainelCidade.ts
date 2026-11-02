import {botaoIcone} from './Icones';
import Phaser from 'phaser';
/** Painel DOM com rolagem, fonte legível e botões acessíveis em viewport pequeno. */
export class PainelCidade {
  readonly root=document.createElement('section');
  private elemento: Phaser.GameObjects.DOMElement;
  constructor(private cena: Phaser.Scene, titulo: string, private falas=false) {
    this.root.setAttribute('aria-label',titulo);
    for(const e of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend'])this.root.addEventListener(e,v=>v.stopPropagation());
    this.root.style.cssText='box-sizing:border-box;overflow:auto;overscroll-behavior:contain;touch-action:pan-y;background:#fff9ff;color:#5a2fa8;border:4px solid #b58cf5;border-radius:24px;padding:18px;font:18px Fredoka,sans-serif;box-shadow:0 10px 35px #3d247060;';
    this.elemento=cena.add.dom(0,0,this.root).setDepth(9001);
    cena.scale.on('resize',this.reorganizar,this);
    cena.events.once('shutdown',this.destruir,this);this.reorganizar();
  }
  destruir():void{this.cena.scale.off('resize',this.reorganizar,this);this.cena.events.off('shutdown',this.destruir,this);this.elemento.destroy()}
  reorganizar(): void { const w=this.cena.scale.width,h=this.cena.scale.height;this.root.style.width=`${Math.min(600,w-20)}px`;this.root.style.maxHeight=`${h-20}px`;this.elemento.updateSize().setPosition(w/2,h/2) }
  texto(texto: string, tag='p'): HTMLElement { const p=document.createElement(tag);p.textContent=texto;if(!this.falas)p.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);';this.root.append(p);return p }
  botao(texto: string, acao:()=>void, fala=false): HTMLButtonElement {
    const b=botaoIcone(texto,acao);if(fala){b.dataset.fala='';b.textContent=texto;b.style.cssText+='width:100%;font:600 22px Fredoka,sans-serif;color:#5a2fa8;';}b.style.margin='8px';this.root.append(b);return b;
  }
}
