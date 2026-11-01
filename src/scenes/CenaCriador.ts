import Phaser from 'phaser';
import { CABELOS, CORES, FONTE } from '../config/assets';
import { persistir, progresso } from '../game/estado';
import { registrar } from '../net/sessao';
import { Botao } from '../ui/Botao';
import { AvatarAnimado } from '../ui/AvatarAnimado';

/** Criador com grade e avatar reorganizados conforme a área visível do dispositivo. */
export class CenaCriador extends Phaser.Scene {
  private laura!: Phaser.GameObjects.Image;
  private avatar!: AvatarAnimado;
  private cards: { g: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number }[] = [];
  private mascaras: Phaser.GameObjects.Graphics[] = [];
  private pulo = -1000;
  private alvo = { w: 320, h: 520 };
  constructor() { super('Criador') }

  create(): void {
    this.pulo = -1000; this.reconstruir();
    this.scale.on('resize', this.reconstruir, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.reconstruir, this); this.mascaras.forEach(m => m.destroy()); this.mascaras = [] });
  }
  private reconstruir(): void {
    this.mascaras.forEach(m => m.destroy()); this.mascaras = [];
    this.children.removeAll(true); this.cards = [];
    const w = this.scale.width, h = this.scale.height, retrato = w < 600, curto = h < 520;
    this.add.rectangle(w / 2, h / 2, w, h, 0xd9c7f7);
    const fundo = this.add.image(w / 2, h / 2, 'parque').setScale(Math.max((w + 40) / 1280, (h + 40) / 720)).setAlpha(0.45);
    if (this.renderer.type === Phaser.WEBGL) fundo.postFX?.addBlur(0, 1, 1, 1);
    this.add.rectangle(w / 2, h / 2, w, h, 0xbea0f0, 0.3);
    const titulo = this.add.text(retrato ? w / 2 : 36, retrato ? 20 : 24, 'My Town, My World', { fontFamily: FONTE, fontSize: retrato ? '26px' : curto ? '30px' : '48px', fontStyle: '700', color: '#ffffff' }).setOrigin(retrato ? 0.5 : 0, 0).setShadow(0, 3, '#7a4fc9');
    this.add.text(titulo.x, retrato ? 58 : curto ? 66 : 92, 'Crie o seu visual', { fontFamily: FONTE, fontSize: retrato || curto ? '18px' : '24px', color: CORES.textoRoxo, backgroundColor: '#ffffff', padding: { x: 12, y: 6 } }).setOrigin(retrato ? 0.5 : 0, 0);
    const peY = retrato ? h * (h < 650 ? 0.34 : 0.43) : h - (curto ? 24 : 80);
    const avatarX = retrato ? w / 2 : w * 0.3;
    this.alvo = { w: retrato ? w * 0.48 : w * 0.28, h: retrato ? peY - 88 : h * (curto ? 0.66 : 0.72) };
    this.add.ellipse(avatarX, peY + 2, this.alvo.w, 20, 0x7850c8, 0.2);
    this.laura = this.add.image(avatarX, peY, CABELOS[progresso.cabelo].key).setOrigin(0.5, 1);
    this.avatar = new AvatarAnimado(this.laura);
    const px = retrato ? 12 : w * 0.53, py = retrato ? peY + 16 : curto ? 16 : 96;
    const pw = retrato ? w - 24 : w - px - 24, ph = retrato ? h - py - 82 : h - py - 98;
    const painel = this.add.graphics(); painel.fillStyle(0xffffff, 0.94); painel.fillRoundedRect(px, py, pw, ph, 24);
    this.add.text(px + 16, py + 12, 'Cabelo', { fontFamily: FONTE, fontSize: '22px', fontStyle: '700', color: CORES.textoRoxo });
    const gap = 8, cw = (pw - 32 - gap * 2) / 3, ch = (ph - 58 - gap) / 2;
    CABELOS.forEach((cabelo, i) => {
      const x = px + 16 + i % 3 * (cw + gap), y = py + 48 + Math.floor(i / 3) * (ch + gap);
      const g = this.add.graphics(); this.cards.push({ g, x, y, w: cw, h: ch });
      const alturaRosto = Math.max(36, ch - 38);
      const thumb = this.add.image(x + cw / 2, y + 4, cabelo.key).setOrigin(0.5, 0);
      thumb.setScale(alturaRosto * 2.5 / thumb.height);
      const mascara = this.make.graphics({}, false); mascara.fillStyle(0xffffff); mascara.fillRoundedRect(x + 3, y + 3, cw - 6, alturaRosto, 12); this.mascaras.push(mascara);
      thumb.setMask(mascara.createGeometryMask());
      this.add.text(x + cw / 2, y + ch - 18, cabelo.nome, { fontFamily: FONTE, fontSize: retrato || curto ? '14px' : '17px', color: CORES.textoRoxo, align: 'center', wordWrap: { width: cw - 6 } }).setOrigin(0.5);
      this.add.zone(x, y, cw, ch).setOrigin(0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.escolher(i));
    });
    this.desenharCards();
    new Botao(this, retrato ? w / 2 : px + pw / 2, h - 36, 'Ir para o parque', () => { persistir(); this.scene.start('Parque') }, { tamanho: retrato || curto ? 20 : 26, largura: retrato ? w - 32 : 250 });
  }
  private escolher(i: number): void {
    progresso.cabelo = i; persistir(); registrar({ tipo: 'cabelo', cabelo: i });
    this.laura.setTexture(CABELOS[i].key); this.pulo = this.time.now; this.desenharCards();
  }
  private desenharCards(): void {
    this.cards.forEach(({ g, x, y, w, h }, i) => {
      g.clear(); g.fillStyle(0xeadfff); g.fillRoundedRect(x, y, w, h, 16);
      g.lineStyle(i === progresso.cabelo ? 4 : 2, i === progresso.cabelo ? CORES.roxo : 0xe3d3ff); g.strokeRoundedRect(x, y, w, h, 16);
    });
  }
  update(t: number): void {
    const k = Phaser.Math.Clamp((t - this.pulo) / 450, 0, 1), pulo = 1 + Math.sin(k * Math.PI) * 0.08;
    const base = Math.min(this.alvo.w / this.laura.width, this.alvo.h / this.laura.height);
    this.laura.setScale(base * pulo);
    this.avatar.atualizar(k < 1 ? 'acenar' : 'parada', t / 1000);
  }
}
