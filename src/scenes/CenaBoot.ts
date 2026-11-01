import Phaser from 'phaser';
import { supabase } from '../net/supabase';
import { CABELOS, CORES, FONTE, IMAGENS } from '../config/assets';

/** Carrega fonte e imagens com barra de progresso, gera texturas de particulas e abre o criador. */
export class CenaBoot extends Phaser.Scene {
  constructor() { super('Boot') }

  preload(): void {
    const { width: w, height: h } = this.scale;
    this.add.text(w / 2, h / 2 - 60, 'My Town, My World', { fontFamily: FONTE, fontSize: '48px', fontStyle: '700', color: '#ffffff' }).setOrigin(0.5);
    const barraFundo = this.add.graphics(); barraFundo.fillStyle(0xffffff, 0.2); barraFundo.fillRoundedRect(w / 2 - 260, h / 2 + 10, 520, 28, 14);
    const barra = this.add.graphics();
    this.load.on('progress', (v: number) => { barra.clear(); barra.fillStyle(CORES.lilas, 1); barra.fillRoundedRect(w / 2 - 256, h / 2 + 14, Math.max(20, 512 * v), 20, 10) });
    this.load.setBaseURL(import.meta.env.BASE_URL);
    for (const c of CABELOS) this.load.image(c.key, c.arquivo);
    for (const [k, v] of Object.entries(IMAGENS)) this.load.image(k, v);
  }

  async create(): Promise<void> {
    const g = this.make.graphics({}, false);
    g.fillStyle(0xffffff); g.fillRect(0, 0, 12, 8); g.generateTexture('confete', 12, 8); g.clear();
    g.fillStyle(0xffffff); g.fillCircle(6, 6, 6); g.generateTexture('poeira', 12, 12); g.destroy();
    try { await document.fonts.load('700 26px Fredoka'); await document.fonts.load('600 26px Fredoka') } catch { /* segue com fonte reserva */ }
    this.scene.start(supabase ? 'Entrar' : 'Criador');
  }
}
