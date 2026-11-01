import Phaser from 'phaser';
import { CORES, FONTE } from '../config/assets';
import { Botao, EstiloBotao } from './Botao';

export interface OpcaoDialogo { texto: string; acao?: () => void; estilo?: EstiloBotao }

/** Caixa de dialogo com rosto redondo, nome, fala e botoes de resposta (frases prontas, sem chat livre). */
export class Dialogo extends Phaser.GameObjects.Container {
  aberto = false;
  private caixa: Phaser.GameObjects.Graphics;
  private rosto: Phaser.GameObjects.Image;
  private nome: Phaser.GameObjects.Text;
  private fala: Phaser.GameObjects.Text;
  private botoes: Botao[] = [];
  private bloqueio: Phaser.GameObjects.Zone;

  constructor(cena: Phaser.Scene) {
    super(cena, 640, 88);
    this.bloqueio = cena.add.zone(0, -88, 1280, 720).setOrigin(0.5, 0).setInteractive();
    this.bloqueio.on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, ev: Phaser.Types.Input.EventData) => ev.stopPropagation());
    this.caixa = cena.add.graphics();
    const g = this.caixa;
    g.fillStyle(0x3c1478, 0.25); g.fillRoundedRect(-410, 12, 820, 200, 30);
    g.fillStyle(CORES.branco, 0.96); g.fillRoundedRect(-410, 0, 820, 200, 30);
    g.lineStyle(5, CORES.lilas, 1); g.strokeRoundedRect(-410, 0, 820, 200, 30);
    g.fillStyle(0xefe5ff, 1); g.fillCircle(-326, 80, 62); g.lineStyle(4, 0xd6c2fa, 1); g.strokeCircle(-326, 80, 62);
    this.rosto = cena.add.image(-326, 80, '__DEFAULT');
    const mascara = cena.make.graphics({}, false); mascara.fillStyle(0xffffff); mascara.fillCircle(640 - 326, 88 + 80, 60);
    this.rosto.setMask(mascara.createGeometryMask());
    this.nome = cena.add.text(-240, 20, '', { fontFamily: FONTE, fontSize: '20px', fontStyle: '700', color: '#8b55e6' });
    this.fala = cena.add.text(-240, 48, '', { fontFamily: FONTE, fontSize: '26px', fontStyle: '600', color: CORES.textoEscuro, wordWrap: { width: 620 }, lineSpacing: 2 });
    this.add([this.bloqueio, this.caixa, this.rosto, this.nome, this.fala]);
    this.setDepth(6000).setVisible(false);
    cena.add.existing(this);
  }

  abrir(nome: string, rostoKey: string | null, texto: string, opcoes: OpcaoDialogo[]): void {
    this.aberto = true;
    this.nome.setText(nome); this.fala.setText(texto);
    if (rostoKey) {
      this.rosto.setTexture(rostoKey).setVisible(true);
      const src = this.scene.textures.get(rostoKey).getSourceImage();
      const s = 186 / src.width; // rosto em close: 150% da largura do circulo
      // background-position: 50% 8% do protótipo: 8% do excedente vertical.
      this.rosto.setScale(s).setOrigin(0.5, 0).setY(80 - 62 - (src.height * s - 124) * 0.08);
    } else this.rosto.setVisible(false);
    this.botoes.forEach((b) => b.destroy()); this.botoes = [];
    const yb = Math.max(150, 48 + this.fala.height + 34);
    let x = -240;
    for (const o of opcoes) {
      const b = new Botao(this.scene, 0, yb, o.texto, () => { this.fechar(); o.acao?.() }, { estilo: o.estilo, tamanho: 18 });
      b.setX(x + b.largura / 2); x += b.largura + 12;
      this.add(b); this.botoes.push(b);
    }
    this.setVisible(true).setAlpha(0).setY(128);
    this.scene.tweens.add({ targets: this, y: 88, alpha: 1, duration: 300, ease: 'Quad.out' });
  }

  fechar(): void { this.aberto = false; this.setVisible(false) }
}
