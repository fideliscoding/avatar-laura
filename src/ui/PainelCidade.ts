import Phaser from 'phaser';
/** Painel DOM com rolagem, fonte legível e botões acessíveis em viewport pequeno. */
export class PainelCidade {
  readonly root=document.createElement('section');
  private elemento: Phaser.GameObjects.DOMElement;
  constructor(private cena: Phaser.Scene, titulo: string) {
    this.root.setAttribute('aria-label',titulo);
    this.root.style.cssText='box-sizing:border-box;overflow:auto;overscroll-behavior:contain;touch-action:pan-y;background:#fff9ff;color:#5a2fa8;border:4px solid #b58cf5;border-radius:24px;padding:18px;font:18px Fredoka,sans-serif;box-shadow:0 10px 35px #3d247060;';
    this.elemento=cena.add.dom(0,0,this.root).setDepth(9001);
    cena.scale.on('resize',this.reorganizar,this);
    cena.events.once('shutdown',()=>{cena.scale.off('resize',this.reorganizar,this);this.elemento.destroy()});this.reorganizar();
  }
  reorganizar(): void { const w=this.cena.scale.width,h=this.cena.scale.height;this.root.style.width=`${Math.min(600,w-20)}px`;this.root.style.maxHeight=`${h-20}px`;this.elemento.updateSize().setPosition(w/2,h/2) }
  texto(texto: string, tag='p'): HTMLElement { const p=document.createElement(tag);p.textContent=texto;this.root.append(p);return p }
  botao(texto: string, acao:()=>void): HTMLButtonElement {
    const b=document.createElement('button');b.type='button';b.textContent=texto;b.style.cssText='display:block;width:100%;min-height:48px;margin:10px 0;padding:10px;border:0;border-radius:16px;background:#8b55e6;color:white;font:600 17px Fredoka,sans-serif;cursor:pointer;touch-action:manipulation';b.addEventListener('click',acao);this.root.append(b);return b;
  }
}
