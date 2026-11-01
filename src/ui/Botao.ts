import Phaser from 'phaser';
import { CORES, FONTE } from '../config/assets';

export type EstiloBotao = 'roxo' | 'rosa';

/** Botao arredondado no estilo do prototipo (gradiente simulado + sombra inferior). */
export class Botao extends Phaser.GameObjects.Container {
  private fundo: Phaser.GameObjects.Graphics;
  private rotulo: Phaser.GameObjects.Text;
  private bw = 0; private bh = 0;

  constructor(cena: Phaser.Scene, x: number, y: number, texto: string, aoClicar: () => void, opts: { estilo?: EstiloBotao; tamanho?: number; largura?: number; altura?: number } = {}) {
    super(cena, x, y);
    const tam = opts.tamanho ?? 26;
    const estilo = opts.estilo ?? 'roxo';
    this.rotulo = cena.add.text(0, 0, texto, { fontFamily: FONTE, fontSize: `${tam}px`, fontStyle: '700', color: '#ffffff' }).setOrigin(0.5);
    this.bw = Math.max(this.rotulo.width + tam * 1.6, opts.largura ?? 44); this.bh = Math.max(44, opts.altura ?? 0, tam * 2.1);
    this.fundo = cena.add.graphics();
    this.desenhar(estilo, false);
    this.add([this.fundo, this.rotulo]);
    this.setSize(this.bw, this.bh + 6);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => { ev.stopPropagation(); this.desenhar(estilo, true) });
    this.on('pointerout', () => this.desenhar(estilo, false));
    this.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => { ev.stopPropagation(); this.desenhar(estilo, false); aoClicar() });
    cena.add.existing(this);
  }

  get largura(): number { return this.bw }

  private desenhar(estilo: EstiloBotao, apertado: boolean): void {
    const g = this.fundo; g.clear();
    const [cor, sombra, claro] = estilo === 'rosa' ? [CORES.rosa, CORES.rosaEscuro, 0xffb3d6] : [0x7c45e0, CORES.roxoEscuro, 0xa274f5];
    const r = this.bh / 2, dy = apertado ? 4 : 0;
    if (!apertado) { g.fillStyle(sombra, 1); g.fillRoundedRect(-this.bw / 2, -this.bh / 2 + 6, this.bw, this.bh, r) }
    g.fillStyle(cor, 1); g.fillRoundedRect(-this.bw / 2, -this.bh / 2 + dy, this.bw, this.bh, r);
    g.fillStyle(claro, 1); g.fillRoundedRect(-this.bw / 2 + 4, -this.bh / 2 + dy + 3, this.bw - 8, this.bh * 0.45, { tl: r - 4, tr: r - 4, bl: 6, br: 6 });
    this.rotulo.setY(dy);
  }
}
