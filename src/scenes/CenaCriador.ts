import Phaser from 'phaser';
import { CABELOS, CORES, FONTE } from '../config/assets';
import { persistir, progresso } from '../game/estado';
import { Botao } from '../ui/Botao';

/** Tela "Crie o seu visual": escolha de cabelo (6 opcoes) com a Laura grande a esquerda. */
export class CenaCriador extends Phaser.Scene {
  private laura!: Phaser.GameObjects.Image;
  private cards: Phaser.GameObjects.Graphics[] = [];
  private pulo = 0;

  constructor() { super('Criador') }

  create(): void {
    const fundo = this.add.image(640, 360, 'parque').setDisplaySize(1320, 760).setAlpha(0.55);
    if (this.renderer.type === Phaser.WEBGL) fundo.postFX?.addBlur(1, 2, 2, 1.2);
    const tinta = this.add.graphics();
    tinta.fillStyle(0xbea0f0, 0.45); tinta.fillRect(0, 0, 1280, 720);
    tinta.fillStyle(0xffffff, 0.35); tinta.fillCircle(486, 396, 330);

    this.add.text(60, 34, 'My Town, My World', { fontFamily: FONTE, fontSize: '54px', fontStyle: '700', color: '#ffffff' })
      .setShadow(0, 4, '#7a4fc9', 0, false, true);
    const sub = this.add.text(82, 112, 'Crie o seu visual', { fontFamily: FONTE, fontSize: '26px', fontStyle: '600', color: CORES.textoRoxo });
    const pill = this.add.graphics(); pill.fillStyle(0xffffff, 0.75); pill.fillRoundedRect(64, 106, sub.width + 36, 42, 21); pill.setDepth(-1);
    sub.setDepth(1);

    const sombra = this.add.ellipse(400, 638, 300, 56, 0x7850c8, 0.35);
    sombra.setDepth(0);
    this.laura = this.add.image(400, 640, CABELOS[progresso.cabelo].key).setOrigin(0.5, 1);
    this.ajustarLaura();

    // painel
    const px = 664, py = 96;
    const painel = this.add.graphics();
    painel.fillStyle(0x502896, 0.18); painel.fillRoundedRect(px, py + 14, 560, 520, 34);
    painel.fillStyle(0xffffff, 0.85); painel.fillRoundedRect(px, py, 560, 520, 34);
    painel.lineStyle(4, 0xffffff, 1); painel.strokeRoundedRect(px, py, 560, 520, 34);
    this.add.text(px + 32, py + 24, 'Cabelo', { fontFamily: FONTE, fontSize: '28px', fontStyle: '700', color: '#6b3fc0' });

    CABELOS.forEach((c, i) => {
      const cx = px + 26 + (i % 3) * 176, cy = py + 76 + Math.floor(i / 3) * 206, cw = 160, ch = 190;
      const g = this.add.graphics(); this.cards.push(g);
      const thumb = this.add.image(cx + cw / 2, cy + 6, c.key).setOrigin(0.5, 0);
      thumb.setScale((150 * 2.5) / thumb.height); // cabeca em close, como no prototipo
      const m = this.make.graphics({}, false); m.fillStyle(0xffffff); m.fillRoundedRect(cx + 4, cy + 4, cw - 8, 150, 20);
      thumb.setMask(m.createGeometryMask());
      this.add.text(cx + cw / 2, cy + ch - 22, c.nome, { fontFamily: FONTE, fontSize: '18px', fontStyle: '600', color: CORES.textoRoxo }).setOrigin(0.5);
      const zona = this.add.zone(cx, cy, cw, ch).setOrigin(0).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => this.escolher(i));
      (g as Phaser.GameObjects.Graphics & { box?: number[] }).box = [cx, cy, cw, ch];
    });
    this.desenharCards();

    new Botao(this, 1010, 670, 'Ir para o parque', () => { persistir(); this.scene.start('Parque') });
  }

  private ajustarLaura(): void { this.laura.setScale(Math.min(320 / this.laura.width, 520 / this.laura.height)) }

  private escolher(i: number): void {
    progresso.cabelo = i; persistir();
    this.laura.setTexture(CABELOS[i].key); this.ajustarLaura();
    this.pulo = this.time.now; this.desenharCards();
  }

  private desenharCards(): void {
    this.cards.forEach((g, i) => {
      const [x, y, w, h] = (g as Phaser.GameObjects.Graphics & { box: number[] }).box;
      const sel = i === progresso.cabelo;
      g.clear();
      if (sel) { g.fillStyle(CORES.roxo, 0.25); g.fillRoundedRect(x - 4, y - 4, w + 8, h + 8, 28) }
      g.fillStyle(0xeadfff, 1); g.fillRoundedRect(x, y, w, h, 24);
      g.lineStyle(4, sel ? CORES.roxo : 0xeadfff, 1); g.strokeRoundedRect(x, y, w, h, 24);
    });
  }

  update(t: number): void {
    const k = Math.min(1, (t - this.pulo) / 450);
    const s = 1 + Math.sin(k * Math.PI) * 0.08, br = Math.sin(t / 600) * 0.012;
    const base = Math.min(320 / this.laura.width, 520 / this.laura.height);
    this.laura.setScale(base * (s - br), base * (s + br));
  }
}
