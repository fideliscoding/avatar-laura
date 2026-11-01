import Phaser from 'phaser';
import { PROPS, BAL, GANG, PEDRO, AREIA, CURVA_ESC, VEL_LAURA, VEL_BIA, MOVIMENTO, PARADAS, PASSEIO_BIA, ANIMACOES, FALAS_PARQUE } from '../config/parque';
import { CABELOS, CORES, FONTE } from '../config/assets';
import { persistir, progresso, recompensarMissao } from '../game/estado';
import { aceitarAjuda, cavarAreia, escolher, EstadoMissao, novaMissao, Opcao, TEXTOS } from '../game/missaoPedrinho';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';

type Brinquedo = 'balanco' | 'escorregador' | 'gangorra' | 'carrossel';
type Alvo = Brinquedo | 'pedro' | 'areia' | 'vovo' | 'sorvete';
type EstadoLaura = 'parada' | Brinquedo | 'danca';

interface Personagem { img: Phaser.GameObjects.Image; x: number; y: number; h: number; w: number; lado: 1 | -1; fala?: Phaser.GameObjects.Container }

export class CenaParque extends Phaser.Scene {
  private L!: Personagem & { estado: EstadoLaura; t: number; tx: number; ty: number; andando: boolean; arrastando: boolean; aoChegar: (() => void) | null; slideT: number };
  private bia!: Personagem & { t: number; estado: 'andar' | 'esperar'; tx: number; ty: number };
  private pedro!: Personagem & { feliz: boolean };
  private vovo!: Personagem;
  private vovoT = 0;
  private props: Record<string, Phaser.GameObjects.Image> = {};
  private balanco!: { pivo: Phaser.GameObjects.Container; px: number; py: number; th: number };
  private gangorra!: { tabua: Phaser.GameObjects.Image; pvx: number; pvy: number; h: number };
  private esc!: { x: number; y: number; w: number };
  private carrinho!: Phaser.GameObjects.Image;
  private balao!: Phaser.GameObjects.Container;
  private dica!: Phaser.GameObjects.Arc;
  private dicaTween?: Phaser.Tweens.Tween;
  private textoMissao!: Phaser.GameObjects.Text;
  private caixaMissao!: Phaser.GameObjects.Graphics;
  private textoMoedas!: Phaser.GameObjects.Text;
  private hudMoedas!: Phaser.GameObjects.Container;
  private dialogo!: Dialogo;
  private missao: EstadoMissao = novaMissao();
  private confete!: Phaser.GameObjects.Particles.ParticleEmitter;
  private poeira!: Phaser.GameObjects.Particles.ParticleEmitter;
  private paradas!: Record<Alvo, { x: number; y: number }>;

  constructor() { super('Parque') }

  create(): void {
    this.vovoT = 0;
    this.missao = progresso.missoesConcluidas.includes('pedrinho-carrinho') ? { etapa: 'concluida', tentativasErradas: 0 } : novaMissao();
    this.add.image(0, 0, 'parque').setOrigin(0).setDisplaySize(1280, 720).setDepth(-10);
    const fundoClick = this.add.zone(0, 0, 1280, 720).setOrigin(0).setDepth(-9).setInteractive();
    fundoClick.on('pointerdown', (p: Phaser.Input.Pointer) => this.irPara(null, p.x, p.y));

    for (const [nome, p] of Object.entries(PROPS)) {
      const img = this.add.image(p.cx, p.b, p.key).setOrigin(0.5, 1);
      img.setScale(p.w / img.width).setDepth(p.b);
      img.setInteractive({ pixelPerfect: true, useHandCursor: true }).on('pointerdown', () => this.irPara(nome as Alvo));
      this.props[nome] = img;
    }
    this.vovo = { img: this.props.vovo, x: PROPS.vovo.cx, y: PROPS.vovo.b, h: this.props.vovo.displayHeight, w: PROPS.vovo.w, lado: 1 };
    this.props.vovo.setOrigin(0.7, 1).setX(PROPS.vovo.cx + PROPS.vovo.w * 0.2); // aceno gira perto da mao

    // Balanco: estrutura fixa + pivo com correntes e assento
    const s = BAL.w / 510;
    const estrutura = this.add.image(BAL.left, BAL.top, 'balanco-estrutura').setOrigin(0).setScale(s).setDepth(300);
    estrutura.setInteractive({ pixelPerfect: true, useHandCursor: true }).on('pointerdown', () => this.irPara('balanco'));
    const px = BAL.left + 241 * s, py = BAL.top + 44 * s, gap = 108 * s;
    const pivo = this.add.container(px, py).setDepth(420);
    for (const dx of [-gap / 2, gap / 2]) {
      const c = this.add.graphics(); c.fillStyle(0x8d8d99); c.fillRect(dx - 2, 0, 4, BAL.corrente);
      for (let y = 0; y < BAL.corrente; y += 12) { c.fillStyle(0x5f5f6b); c.fillRect(dx - 2, y + 6, 4, 2); c.fillStyle(0xb7b7c2); c.fillRect(dx - 2, y + 8, 4, 4) }
      pivo.add(c);
    }
    const assento = this.add.image(0, BAL.corrente - 8, 'balanco-assento').setOrigin(0.5, 0);
    assento.setScale(92 / assento.width); pivo.add(assento);
    this.balanco = { pivo, px, py, th: 0 };

    // Gangorra: mesma imagem dividida em base e tabua (limitacao conhecida, ver docs/ARTE.md)
    const gBase = this.add.image(GANG.cx, GANG.b, 'gangorra').setOrigin(0.5, 1);
    const gs = GANG.w / gBase.width, gh = gBase.height;
    gBase.setScale(gs).setCrop(0, gh * GANG.corte, gBase.width, gh * (1 - GANG.corte)).setDepth(GANG.b);
    const tabua = this.add.image(GANG.cx, GANG.b - gh * gs + gh * gs * 0.36, 'gangorra').setOrigin(0.5, 0.36).setScale(gs);
    tabua.setCrop(0, 0, tabua.width, gh * (GANG.corte + 0.02)).setDepth(GANG.b + 1);
    for (const o of [gBase, tabua]) o.setInteractive({ pixelPerfect: true, useHandCursor: true }).on('pointerdown', () => this.irPara('gangorra'));
    this.gangorra = { tabua, pvx: GANG.cx, pvy: tabua.y, h: gh * gs };

    const pe = PROPS.escorregador; const escImg = this.props.escorregador;
    this.esc = { x: pe.cx - pe.w / 2, y: pe.b - escImg.displayHeight, w: pe.w };

    // Areia (zona invisivel), dica pulsante e carrinho azul escondido
    this.add.zone(AREIA.x, AREIA.y, AREIA.w, AREIA.h).setOrigin(0).setDepth(470).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.irPara('areia'));
    this.dica = this.add.circle(AREIA.cx, AREIA.cy - 5, 35).setStrokeStyle(5, 0xffffff, 0.95).setDepth(4000).setVisible(false);
    this.carrinho = this.add.image(AREIA.cx, 575, 'carrinho-azul').setOrigin(0.5, 1).setVisible(false);
    this.carrinho.setScale(92 / this.carrinho.width);

    // Pedrinho + balao "!"
    const pImg = this.add.image(PEDRO.x, PEDRO.y, 'pedro-triste').setOrigin(0.5, 1);
    pImg.setInteractive({ pixelPerfect: true, useHandCursor: true }).on('pointerdown', () => this.irPara('pedro'));
    this.pedro = { img: pImg, x: PEDRO.x, y: PEDRO.y, h: PEDRO.h, w: PEDRO.h * 0.66, lado: 1, feliz: false };
    this.ajustar(this.pedro);
    this.balao = this.criarBalaoExclamacao();

    // Bia (NPC que passeia entre balanco e escorregador)
    const bImg = this.add.image(470, 440, 'bia').setOrigin(0.5, 1);
    this.bia = { img: bImg, x: 470, y: 440, h: 148, w: 111, lado: 1, t: 0, estado: 'andar', tx: 560, ty: 352 };
    this.ajustar(this.bia);

    // Laura
    const lImg = this.add.image(470, 640, CABELOS[progresso.cabelo].key).setOrigin(0.5, 1);
    this.L = { img: lImg, x: 470, y: 640, h: 172, w: 107, lado: 1, estado: 'parada', t: 0, tx: 470, ty: 640, andando: false, arrastando: false, aoChegar: null, slideT: 0 };
    this.ajustar(this.L);
    lImg.setInteractive({ draggable: true, useHandCursor: true });
    this.configurarArrasto();

    this.paradas = {
      balanco: { x: px, y: py + BAL.corrente + 52 }, ...PARADAS, gangorra: { x: GANG.cx - GANG.w * 0.36, y: GANG.b + 8 },
    };

    this.criarHud();
    this.dialogo = new Dialogo(this);
    this.confete = this.add.particles(0, 0, 'confete', {
      emitting: false, lifespan: 3600, speedX: { min: -480, max: 480 }, speedY: { min: -840, max: -240 }, gravityY: 1150,
      rotate: { start: 0, end: 720, random: true }, scaleY: { min: 0.5, max: 1 }, tint: [...CORES.confete], alpha: { start: 1, end: 0.6 },
    }).setDepth(7000);
    this.poeira = this.add.particles(0, 0, 'poeira', {
      emitting: false, lifespan: 750, speedX: { min: -210, max: 210 }, speedY: { min: -300, max: 0 }, gravityY: 650,
      scale: { min: 0.5, max: 1.1 }, tint: 0xe8c98f, alpha: { start: 1, end: 0 },
    }).setDepth(7000);

    if (this.missao.etapa === 'concluida') this.deixarPedroFeliz(false);
    this.falar(this.L, FALAS_PARQUE.chegada, 1800);
  }

  // ---------- utilitarios
  private ajustar(p: Personagem): void { p.img.setScale(Math.min(p.w / p.img.width, p.h / p.img.height)) }

  private criarBalaoExclamacao(): Phaser.GameObjects.Container {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2); g.fillCircle(0, 4, 25);
    g.fillStyle(0xffffff); g.fillCircle(0, 0, 23); g.lineStyle(4, CORES.roxo); g.strokeCircle(0, 0, 23);
    g.fillStyle(CORES.roxo); g.fillTriangle(-7, 22, 7, 22, 0, 33);
    const t = this.add.text(0, 0, '!', { fontFamily: FONTE, fontSize: '30px', fontStyle: '700', color: '#7c45e0' }).setOrigin(0.5);
    return this.add.container(0, 0, [g, t]).setDepth(4000);
  }

  private falar(p: Personagem, texto: string, ms = 2200): void {
    p.fala?.destroy();
    const t = this.add.text(0, 0, texto, { fontFamily: FONTE, fontSize: '18px', fontStyle: '600', color: CORES.textoRoxo }).setOrigin(0.5);
    const w = t.width + 28, h = t.height + 12;
    const g = this.add.graphics(); g.fillStyle(0x000000, 0.12); g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 18);
    g.fillStyle(0xffffff); g.fillRoundedRect(-w / 2, -h / 2, w, h, 18); g.lineStyle(3, CORES.lilas); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    const c = this.add.container(p.x, p.y - p.h - 12 - h / 2, [g, t]).setDepth(4500);
    p.fala = c;
    this.time.delayedCall(ms, () => this.tweens.add({ targets: c, alpha: 0, duration: 300, onComplete: () => { c.destroy(); if (p.fala === c) p.fala = undefined } }));
  }

  private posicionarFala(p: Personagem): void { if (p.fala?.active) p.fala.setPosition(p.x, p.y - p.h - 12 - 20) }

  private criarHud(): void {
    new Botao(this, 0, 44, 'Trocar cabelo', () => { this.pararBrinquedo(); persistir(); this.scene.start('Criador') }, { tamanho: 18 }).setDepth(5000).setX(18 + 82);
    this.caixaMissao = this.add.graphics().setDepth(5000);
    this.textoMissao = this.add.text(214, 27, '', { fontFamily: FONTE, fontSize: '20px', fontStyle: '600', color: CORES.textoRoxo, wordWrap: { width: 490 } }).setDepth(5001);
    this.definirObjetivo(this.missao.etapa === 'concluida' ? TEXTOS.pedroDepois : TEXTOS.objetivoInicial);

    const g = this.add.graphics();
    const moeda = this.add.graphics();
    moeda.fillStyle(0xb87800); moeda.fillCircle(0, 2, 19); moeda.fillStyle(0xf6b81c); moeda.fillCircle(0, 0, 19);
    moeda.fillStyle(0xffe27a); moeda.fillCircle(0, 0, 16); moeda.fillStyle(0xffd23f); moeda.fillCircle(0, 0, 13);
    const estrela: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 9.5, a = -Math.PI / 2 + i * Math.PI / 5; estrela.push(new Phaser.Math.Vector2(Math.cos(a) * r, Math.sin(a) * r)) }
    moeda.fillStyle(0xe39a06); moeda.fillPoints(estrela, true);
    this.textoMoedas = this.add.text(34, 0, String(progresso.moedas), { fontFamily: FONTE, fontSize: '30px', fontStyle: '700', color: CORES.textoRoxo }).setOrigin(0, 0.5);
    this.hudMoedas = this.add.container(0, 44, [g, moeda, this.textoMoedas]).setDepth(5000);
    this.redesenharMoedas();
  }

  private redesenharMoedas(): void {
    const g = this.hudMoedas.getAt(0) as Phaser.GameObjects.Graphics;
    const w = 34 + this.textoMoedas.width + 44;
    g.clear(); g.fillStyle(0x461e8c, 0.2); g.fillRoundedRect(-30, -24, w, 56, 28);
    g.fillStyle(0xffffff, 0.9); g.fillRoundedRect(-30, -28, w, 56, 28); g.lineStyle(4, CORES.lilas); g.strokeRoundedRect(-30, -28, w, 56, 28);
    this.hudMoedas.setX(1280 - 22 - w + 30);
  }

  private definirObjetivo(t: string): void {
    this.textoMissao.setText(t);
    const g = this.caixaMissao; g.clear();
    g.fillStyle(0xffffff, 0.9); g.fillRoundedRect(196, 16, this.textoMissao.width + 36, this.textoMissao.height + 22, 22);
    g.lineStyle(4, CORES.lilas); g.strokeRoundedRect(196, 16, this.textoMissao.width + 36, this.textoMissao.height + 22, 22);
  }

  private ganharMoedas(n: number): void {
    if (n <= 0) return;
    let k = 0;
    const moedasIniciais = progresso.moedas - n;
    this.time.addEvent({ delay: 70, repeat: n - 1, callback: () => {
      k++; this.textoMoedas.setText(String(moedasIniciais + k)); this.redesenharMoedas();
      this.tweens.add({ targets: this.hudMoedas, scale: 1.25, duration: 120, yoyo: true });
      if (k === n) persistir();
    } });
  }

  // ---------- movimento e entrada
  private configurarArrasto(): void {
    const L = this.L;
    let dx = 0, dy = 0;
    L.img.on('dragstart', (p: Phaser.Input.Pointer) => {
      if (L.estado === 'danca' || this.dialogo.aberto) return;
      this.pararBrinquedo(); L.arrastando = true; L.andando = false; L.aoChegar = null; dx = L.x - p.x; dy = L.y - p.y;
    });
    L.img.on('drag', (p: Phaser.Input.Pointer) => { if (!L.arrastando) return; L.x = Phaser.Math.Clamp(p.x + dx, 40, 1240); L.y = Phaser.Math.Clamp(p.y + dy, 150, 715) });
    L.img.on('dragend', () => {
      if (!L.arrastando) return; L.arrastando = false;
      let melhor: Brinquedo | null = null, md = MOVIMENTO.raioArrasto;
      for (const k of ['balanco', 'escorregador', 'gangorra', 'carrossel'] as Brinquedo[]) {
        const r = this.paradas[k]; const d = Math.hypot(r.x - L.x, (r.y - L.y) * MOVIMENTO.pesoVertical);
        if (d < md) { md = d; melhor = k }
      }
      if (melhor) { L.x = this.paradas[melhor].x; L.y = this.paradas[melhor].y; this.iniciarBrinquedo(melhor) } else L.y = Math.max(300, L.y);
    });
  }

  private andarAte(x: number, y: number, aoChegar?: () => void): void {
    if (this.L.estado === 'danca') return;
    this.pararBrinquedo();
    Object.assign(this.L, { tx: Phaser.Math.Clamp(x, MOVIMENTO.minimoX, MOVIMENTO.maximoX), ty: Phaser.Math.Clamp(y, MOVIMENTO.minimoY, MOVIMENTO.maximoY), andando: true, aoChegar: aoChegar ?? null });
  }

  irPara(alvo: Alvo | null, x = 0, y = 0): void {
    if (this.L.estado === 'danca' || this.dialogo.aberto || this.L.arrastando) return;
    if (!alvo) {
      const anel = this.add.ellipse(x, y, 40, 16).setStrokeStyle(3, 0xffffff, 0.9).setDepth(y);
      this.tweens.add({ targets: anel, scale: 1.6, alpha: 0, duration: 500, onComplete: () => anel.destroy() });
      this.andarAte(x, y); return;
    }
    const r = this.paradas[alvo];
    this.andarAte(r.x, r.y, () => {
      if (alvo === 'pedro') this.conversarPedro();
      else if (alvo === 'areia') this.cavar();
      else if (alvo === 'vovo') this.falar(this.vovo, FALAS_PARQUE.marta, 2000);
      else if (alvo === 'sorvete') this.falar(this.L, FALAS_PARQUE.sorvete, 1800);
      else this.iniciarBrinquedo(alvo);
    });
  }

  iniciarBrinquedo(k: Brinquedo): void {
    const L = this.L; L.andando = false; L.estado = k; L.t = 0; L.slideT = 0;
    L.img.setTexture(CABELOS[progresso.cabelo].key); this.ajustar(L);
    if (k === 'carrossel') L.lado = 1;
  }

  private pararBrinquedo(): void {
    const L = this.L;
    if (L.estado === 'parada' || L.estado === 'danca') return;
    if (L.estado === 'balanco' || L.estado === 'gangorra') { L.x = this.paradas[L.estado].x; L.y = this.paradas[L.estado].y }
    if (L.estado === 'carrossel') { L.x = 180; L.y = 548 }
    L.estado = 'parada'; L.img.setRotation(0);
  }

  // ---------- missao do Pedrinho
  private conversarPedro(): void {
    this.L.lado = this.pedro.x > this.L.x ? 1 : -1;
    if (this.missao.etapa === 'concluida') { this.dialogo.abrir('Pedrinho', 'pedro-feliz', TEXTOS.pedroDepois, [{ texto: 'Vamos!' }]); return }
    this.dialogo.abrir('Pedrinho', 'pedro-triste', TEXTOS.pedroPede, [{ texto: TEXTOS.respostaAjudar, acao: () => {
      this.missao = aceitarAjuda(this.missao);
      this.definirObjetivo(TEXTOS.objetivoProcurar);
      this.dica.setVisible(true);
      this.dicaTween?.stop();
      this.dica.setScale(0.6).setAlpha(1);
      this.dicaTween = this.tweens.add({ targets: this.dica, scale: 1.5, alpha: 0, duration: 1200, repeat: -1 });
    } }]);
  }

  private cavar(): void {
    if (this.missao.etapa === 'concluida') { this.falar(this.L, TEXTOS.areiaDepois, 1600); return }
    const r = cavarAreia(this.missao); this.missao = r.estado;
    this.dicaTween?.stop(); this.dica.setVisible(false);
    this.poeira.explode(40, AREIA.cx, AREIA.cy);
    this.carrinho.setVisible(true).setPosition(AREIA.cx, 575).setDepth(480).setScale(0.3 * 92 / this.carrinho.width);
    const s = 92 / this.carrinho.width;
    this.tweens.chain({ targets: this.carrinho, tweens: [
      { y: 575 - 28, scale: s * 1.15, duration: 400, ease: 'Quad.out' },
      { y: 575, scale: s, duration: 250, ease: 'Quad.in' },
    ] });
    this.time.delayedCall(700, () => this.perguntar());
  }

  private perguntar(): void {
    const o = TEXTOS.opcoes;
    this.dialogo.abrir('Laura', CABELOS[progresso.cabelo].key, TEXTOS.pergunta, [
      { texto: o.A, acao: () => this.escolherOpcao('A') },
      { texto: o.B, acao: () => this.escolherOpcao('B'), estilo: 'rosa' },
      { texto: o.C, acao: () => this.escolherOpcao('C') },
    ]);
  }

  private escolherOpcao(op: Opcao): void {
    const r = escolher(this.missao, op); this.missao = r.estado;
    if (r.conselho) { this.dialogo.abrir('Dona Marta', 'vovo', r.conselho, [{ texto: TEXTOS.tentarDeNovo, acao: () => this.perguntar() }]); return }
    if (op !== 'B') return;
    const alvoX = this.pedro.x - 70;
    this.andarAte(alvoX, this.pedro.y, () => {
      this.L.lado = 1;
      this.carrinho.setDepth(this.pedro.y + 2);
      this.tweens.chain({ targets: this.carrinho, tweens: [
        { x: this.pedro.x - 14, y: this.pedro.y - 88, duration: 350, ease: 'Sine.inOut' },
        { x: this.pedro.x + 66, y: this.pedro.y + 12, scale: this.carrinho.scale * 0.8, duration: 350, ease: 'Sine.inOut' },
      ] });
      this.time.delayedCall(720, () => {
        this.deixarPedroFeliz(true);
        this.confete.explode(180, 640, 250);
        const recompensa = recompensarMissao(progresso, 'pedrinho-carrinho', r.moedas);
        Object.assign(progresso, recompensa.progresso);
        this.ganharMoedas(recompensa.moedas);
        persistir();
        this.L.estado = 'danca'; this.L.t = 0;
        this.falar(this.pedro, TEXTOS.pedroAgradece, 2600);
        this.definirObjetivo(TEXTOS.objetivoConcluida);
        this.time.delayedCall(2700, () => this.dialogo.abrir('Pedrinho', 'pedro-feliz', TEXTOS.pedroAmiga, [
          { texto: 'De nada!' }, { texto: 'Jogar a missão de novo', acao: () => this.reiniciarMissao() },
        ]));
      });
    });
  }

  private deixarPedroFeliz(agora: boolean): void {
    this.pedro.feliz = true; this.pedro.img.setTexture('pedro-feliz'); this.pedro.w = this.pedro.h * 0.9; this.ajustar(this.pedro);
    this.balao.setVisible(false);
    if (!agora) this.carrinho.setVisible(false);
  }

  private reiniciarMissao(): void {
    this.missao = novaMissao();
    // Reinicia a história, preservando o registro da recompensa já recebida.
    persistir();
    this.pedro.feliz = false; this.pedro.img.setTexture('pedro-triste'); this.pedro.w = this.pedro.h * 0.66; this.ajustar(this.pedro);
    this.balao.setVisible(true); this.tweens.killTweensOf(this.carrinho); this.carrinho.setVisible(false);
    this.definirObjetivo(TEXTOS.objetivoInicial);
  }

  // ---------- loop
  private pontoEscorregador(u: number): [number, number] {
    const n = CURVA_ESC.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), k = f - i;
    const a = CURVA_ESC[i], b = CURVA_ESC[i + 1], s = k * k * (3 - 2 * k);
    return [this.esc.x + (a[0] + (b[0] - a[0]) * s) * this.esc.w, this.esc.y + (a[1] + (b[1] - a[1]) * s) * this.esc.w];
  }

  private desenhar(p: Personagem, x: number, y: number, o: { by?: number; rot?: number; sx?: number; sy?: number; oy?: number; z?: number } = {}): void {
    const base = Math.min(p.w / p.img.width, p.h / p.img.height);
    p.img.setOrigin(0.5, o.oy ?? 1).setPosition(x, y + (o.by ?? 0)).setAngle(o.rot ?? 0)
      .setScale(base * (o.sx ?? 1) * p.lado, base * (o.sy ?? 1)).setDepth(o.z ?? y);
  }

  update(time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000), T = time / 1000, L = this.L;
    L.t += dt;
    const frente = CABELOS[progresso.cabelo].key;
    if (L.estado === 'parada') {
      if (L.andando && !L.arrastando) {
        const dx = L.tx - L.x, dy = L.ty - L.y, d = Math.hypot(dx, dy);
        if (d < 4) { L.andando = false; const cb = L.aoChegar; L.aoChegar = null; cb?.() }
        else { const m = Math.min(d, VEL_LAURA * dt); L.x += dx / d * m; L.y += dy / d * m; if (Math.abs(dx) > 3) L.lado = dx > 0 ? 1 : -1 }
      }
      // vista de lado so existe para cabelo liso (limitacao conhecida)
      const tex = L.andando && progresso.cabelo === 0 ? 'laura-lado-liso' : frente;
      if (L.img.texture.key !== tex) L.img.setTexture(tex);
      if (L.arrastando) this.desenhar(L, L.x, L.y, { by: -14, rot: Math.sin(T * 10) * 5, sx: 1.04, sy: 1.04, z: 5000 });
      else if (L.andando) { const ph = T * 11; this.desenhar(L, L.x, L.y, { by: -Math.abs(Math.sin(ph)) * 7, sy: 1 - 0.035 * Math.abs(Math.cos(ph)), sx: 1 + 0.025 * Math.abs(Math.cos(ph)), rot: Math.sin(ph) * 2.5 }) }
      else this.desenhar(L, L.x, L.y, { sy: 1 + Math.sin(T * 2.4) * 0.012, sx: 1 - Math.sin(T * 2.4) * 0.008 });
    } else if (L.estado === 'balanco') {
      const th = Math.sin(L.t * ANIMACOES.balanco.velocidade) * Math.min(1, L.t / ANIMACOES.balanco.entrada) * ANIMACOES.balanco.angulo, r = Phaser.Math.DegToRad(th); this.balanco.th = th;
      L.x = this.balanco.px - Math.sin(r) * BAL.corrente; L.y = this.balanco.py + Math.cos(r) * BAL.corrente;
      this.desenhar(L, L.x, L.y, { oy: 0.64, rot: th, z: 430, sx: 0.95, sy: 0.95 });
    } else if (L.estado === 'escorregador') {
      L.slideT += dt; const dur = ANIMACOES.escorregador.duracao; let u = (L.slideT % (dur + ANIMACOES.escorregador.pausa)) / dur; if (u > 1) u = 1;
      const v = u < 0.5 ? u * 0.9 : 0.45 + (u - 0.5) * 1.1; const [x, y] = this.pontoEscorregador(Math.min(1, v)); const desce = v > 0.47;
      L.x = x; L.y = y; L.lado = 1;
      this.desenhar(L, x, y + (desce ? L.h * 0.3 : 0), { by: desce ? 0 : -Math.abs(Math.sin(L.t * 9)) * 4, rot: desce ? (v < 0.85 ? 18 : 6) : 0, sy: desce ? 0.82 : 1, sx: 0.92, z: desce ? (v < 0.6 ? 420 : 520) : 345 });
      if (L.slideT > (dur + ANIMACOES.escorregador.pausa) * ANIMACOES.escorregador.descidas) { L.estado = 'parada'; L.x = this.paradas.escorregador.x + ANIMACOES.escorregador.saidaX; L.y = ANIMACOES.escorregador.saidaY }
    } else if (L.estado === 'gangorra') {
      const a = Math.sin(L.t * ANIMACOES.gangorra.velocidade) * ANIMACOES.gangorra.angulo, r = Phaser.Math.DegToRad(a); this.gangorra.tabua.setAngle(a);
      const lx = GANG.w * ANIMACOES.gangorra.ponta, ly = -6;
      L.x = this.gangorra.pvx + lx * Math.cos(r) - ly * Math.sin(r); L.y = this.gangorra.pvy + lx * Math.sin(r) + ly * Math.cos(r); L.lado = 1;
      this.desenhar(L, L.x, L.y, { oy: 0.58, rot: a * 0.5, sx: 0.9, sy: 0.9, z: GANG.b + 2 });
    } else if (L.estado === 'carrossel') {
      const a = L.t * ANIMACOES.carrossel.velocidade, P = PROPS.carrossel; L.x = P.cx + Math.cos(a) * ANIMACOES.carrossel.raioX; L.y = P.b - ANIMACOES.carrossel.altura + Math.sin(a) * ANIMACOES.carrossel.raioY; L.lado = Math.sin(a) > 0 ? -1 : 1;
      this.desenhar(L, L.x, L.y, { sx: ANIMACOES.carrossel.escala, sy: ANIMACOES.carrossel.escala, z: Math.sin(a) > 0 ? P.b + 5 : P.b - 5, by: -Math.abs(Math.sin(a * 2)) * 3 });
    } else if (L.estado === 'danca') {
      const k = L.t; let by = 0, sx = 1;
      if (L.img.texture.key !== frente) L.img.setTexture(frente);
      if (k < 1.2) by = -Math.abs(Math.sin(k * Math.PI * 2.5)) * 42;
      else if (k < 2.2) { sx = Math.cos((k - 1.2) * Math.PI * 2); by = -10 }
      else L.estado = 'parada';
      this.desenhar(L, L.x, L.y, { by, sx: Math.abs(sx) < 0.08 ? 0.08 * Math.sign(sx || 1) : sx });
    }
    if (L.estado !== 'gangorra') this.gangorra.tabua.setAngle(0);
    if (L.estado !== 'balanco') this.balanco.th *= 0.96;
    this.balanco.pivo.setAngle(this.balanco.th);
    this.posicionarFala(L);

    // Bia
    const B = this.bia; B.t += dt;
    if (B.estado === 'andar') {
      const dx = B.tx - B.x, dy = B.ty - B.y, d = Math.hypot(dx, dy);
      if (d < 3) { B.estado = 'esperar'; B.t = 0 } else { const m = Math.min(d, VEL_BIA * dt); B.x += dx / d * m; B.y += dy / d * m; B.lado = dx > 0 ? 1 : -1 }
    } else if (B.t > 2.5) {
      B.estado = 'andar'; const noEsc = B.tx > 520; const destino = noEsc ? PASSEIO_BIA.balanco : PASSEIO_BIA.escorregador; B.tx = destino.x; B.ty = destino.y;
      this.falar(B, noEsc ? FALAS_PARQUE.biaBalanco : FALAS_PARQUE.biaEscorregador, 1600);
    }
    const ph = T * 9;
    this.desenhar(B, B.x, B.y, B.estado === 'andar' ? { by: -Math.abs(Math.sin(ph)) * 5, sy: 1 - 0.03 * Math.abs(Math.cos(ph)), rot: Math.sin(ph) * 2 } : { sy: 1 + Math.sin(T * 3) * 0.015 });
    this.posicionarFala(B);

    // Dona Marta (aceno simples: limitacao conhecida)
    const antes = this.vovoT; this.vovoT += dt;
    const w = (this.vovoT % 5) < 1.6 ? Math.sin(this.vovoT * 9) * 2.2 : 0;
    const vs = PROPS.vovo.w / this.props.vovo.width;
    this.props.vovo.setAngle(w).setScale(vs, vs * (1 + Math.sin(T * 1.6) * 0.008));
    if (Math.floor(this.vovoT / 10) !== Math.floor(antes / 10)) this.falar(this.vovo, FALAS_PARQUE.aceno, 1800);
    this.posicionarFala(this.vovo);

    // Pedrinho
    const P = this.pedro; P.lado = 1;
    this.desenhar(P, P.x, P.y, { by: P.feliz ? -Math.abs(Math.sin(T * 6)) * 10 : Math.sin(T * 1.5) * 1.5 });
    this.posicionarFala(P);
    this.balao.setPosition(P.x, P.y - P.h - 35 + Math.sin(T * 4) * 5);
  }
}
