import Phaser from 'phaser';
import { CORES, FONTE } from '../config/assets';
import { Botao, type EstiloBotao } from './Botao';
export interface OpcaoDialogo { texto: string; acao?: () => void; estilo?: EstiloBotao }

/** Diálogo independente da câmera: opções empilhadas no celular e rosto em close. */
export class Dialogo extends Phaser.GameObjects.Container {
  aberto = false;
  private dados?: { nome: string; rosto: string | null; texto: string; opcoes: OpcaoDialogo[] };
  private mascara?: Phaser.GameObjects.Graphics;

  constructor(cena: Phaser.Scene) { super(cena); cena.add.existing(this); this.setDepth(6000).setVisible(false) }

  abrir(nome: string, rosto: string | null, texto: string, opcoes: OpcaoDialogo[]): void {
    this.dados = { nome, rosto, texto, opcoes }; this.aberto = true;
    this.reorganizar(); this.setVisible(true);
  }

  reorganizar(): void {
    if (!this.dados || !this.aberto) return;
    this.removeAll(true); this.mascara?.destroy();
    const { nome, rosto, texto, opcoes } = this.dados;
    const w = this.scene.scale.width, h = this.scene.scale.height;
    const estreito = w < 700 && h >= w, largura = Math.min(860, w - 24), margem = 18;
    const topo = h < 500 ? 8 : Math.min(145, h * 0.17);
    this.setPosition(w / 2, topo);
    const bloqueio = this.scene.add.zone(-w / 2, -topo, w, h).setOrigin(0).setInteractive();
    bloqueio.on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, ev: Phaser.Types.Input.EventData) => ev.stopPropagation());
    this.add(bloqueio);
    const caixa = this.scene.add.graphics(); this.add(caixa);
    const raio = estreito ? 32 : h < 500 ? 40 : 54, cx = -largura / 2 + margem + raio, cy = margem + raio;
    caixa.fillStyle(0xefe5ff); caixa.fillCircle(cx, cy, raio);
    const xTexto = estreito ? -largura / 2 + margem : cx + raio + 24;
    const nomeTexto = this.scene.add.text(estreito ? cx + raio + 12 : xTexto, margem, nome, { fontFamily: FONTE, fontSize: estreito ? '18px' : '20px', fontStyle: '700', color: '#8b55e6' });
    const fala = this.scene.add.text(xTexto, estreito ? margem + raio * 2 + 12 : 46, texto, { fontFamily: FONTE, fontSize: estreito ? '19px' : h < 500 ? '20px' : '24px', color: CORES.textoEscuro, wordWrap: { width: estreito ? largura - margem * 2 : largura - (xTexto + largura / 2) - margem }, lineSpacing: 3 });
    let y = fala.y + fala.height + 22;
    const botoes: Botao[] = [];
    if (estreito) {
      opcoes.forEach(opcao => {
        const botao = new Botao(this.scene, 0, y + 24, opcao.texto, () => { this.fechar(); opcao.acao?.() }, { estilo: opcao.estilo, tamanho: largura < 330 ? 15 : 17, largura: largura - margem * 2, altura: 48 });
        botoes.push(botao); y += 60;
      });
    } else {
      const inicio = h < 500 ? -largura / 2 + margem : xTexto;
      let x = inicio;
      for (const opcao of opcoes) {
        const botao = new Botao(this.scene, 0, y + 24, opcao.texto, () => { this.fechar(); opcao.acao?.() }, { estilo: opcao.estilo, tamanho: 17 });
        if (x + botao.largura > largura / 2 - margem) { x = inicio; y += 58 }
        botao.setPosition(x + botao.largura / 2, y + 24); x += botao.largura + 10; botoes.push(botao);
      }
      y += 58;
    }
    const altura = Math.max(y + 12, raio * 2 + margem * 2);
    caixa.clear(); caixa.fillStyle(0xffffff, 0.98); caixa.fillRoundedRect(-largura / 2, 0, largura, altura, 22);
    caixa.lineStyle(4, CORES.lilas); caixa.strokeRoundedRect(-largura / 2, 0, largura, altura, 22);
    caixa.fillStyle(0xefe5ff); caixa.fillCircle(cx, cy, raio);
    this.add([nomeTexto, fala]);
    if (rosto) {
      const imagem = this.scene.add.image(cx, cy - raio, rosto).setOrigin(0.5, 0);
      const src = this.scene.textures.get(rosto).getSourceImage(), escala = raio * 3 / src.width;
      imagem.setScale(escala).setY(cy - raio - (src.height * escala - raio * 2) * 0.08);
      this.mascara = this.scene.make.graphics({}, false); this.mascara.fillStyle(0xffffff); this.mascara.fillCircle(w / 2 + cx, topo + cy, raio);
      imagem.setMask(this.mascara.createGeometryMask()); this.add(imagem);
    }
    this.add(botoes);
    if (altura + topo > h - 8) {
      // Em paisagem curta, o painel cabe sem reduzir a fonte nem os alvos de toque.
      this.setY(Math.max(6, h - altura - 8));
      if (this.mascara) { this.mascara.clear(); this.mascara.fillStyle(0xffffff); this.mascara.fillCircle(w / 2 + cx, this.y + cy, raio) }
      bloqueio.setY(-this.y);
    }
  }
  fechar(): void { this.aberto = false; this.setVisible(false) }
  destroy(fromScene?: boolean): void { this.mascara?.destroy(); super.destroy(fromScene) }
}
