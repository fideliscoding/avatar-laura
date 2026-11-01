import Phaser from 'phaser';
import { CORES, FONTE } from '../config/assets';
import { TEXTOS_CONTAS } from '../config/contas';
import { progresso, persistir } from '../game/estado';
import { layoutParque } from '../game/layout';
import { sessao, sairDaConta } from '../net/sessao';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';
import type { CenaParque, Alvo } from './CenaParque';

const DESTINOS: { alvo: Alvo; nome: string }[] = [
  { alvo: 'balanco', nome: 'Balanço' }, { alvo: 'escorregador', nome: 'Escorregador' },
  { alvo: 'gangorra', nome: 'Gangorra' }, { alvo: 'carrossel', nome: 'Carrossel' },
  { alvo: 'sorvete', nome: 'Sorvete' }, { alvo: 'vovo', nome: 'Dona Marta' },
  { alvo: 'pedro', nome: 'Pedrinho' }, { alvo: 'areia', nome: 'Areia' },
];

/** Interface em pixels visíveis, independente da câmera que acompanha a Laura. */
export class CenaInterface extends Phaser.Scene {
  dialogo!: Dialogo;
  private parque!: CenaParque;
  private hud!: Phaser.GameObjects.Container;
  private objetivo!: Phaser.GameObjects.Text;
  private moedas!: Phaser.GameObjects.Text;
  private apelido?: Phaser.GameObjects.Text;
  private aviso!: Phaser.GameObjects.Text;
  private pagina = 0;
  private saldo = 0;
  private contagem?: Phaser.Time.TimerEvent;

  constructor() { super('Interface') }
  init(dados: { parque: CenaParque }): void { this.parque = dados.parque }
  create(): void {
    this.pagina = 0; this.saldo = progresso.moedas;
    this.dialogo = new Dialogo(this);
    this.reconstruir(); this.parque.conectarInterface(this);
    this.scale.on('resize', this.reconstruir, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.reconstruir, this) });
  }

  private reconstruir(): void {
    this.contagem?.remove();
    this.hud?.destroy(true);
    this.hud = this.add.container().setDepth(5000);
    const w = this.scale.width, h = this.scale.height, l = layoutParque(w, h, !!sessao.usuario);
    const fundo = this.add.graphics();
    fundo.fillStyle(0xf4edff, 0.97); fundo.fillRect(0, 0, w, l.cabecalho);
    fundo.fillStyle(0xffffff, 0.97); fundo.fillRect(0, h - l.rodape, w, l.rodape);
    this.hud.add(fundo);
    const cabelo = new Botao(this, w < 340 ? 65 : 85, 28, 'Trocar cabelo', () => {
      if (this.dialogo.aberto) return;
      persistir(); this.parque.scene.stop(); this.scene.start('Criador');
    }, { tamanho: w < 340 ? 14 : 16, largura: w < 340 ? 106 : 140 });
    this.hud.add(cabelo);
    this.moedas = this.add.text(w - 16, 28, String(progresso.moedas), { fontFamily: FONTE, fontSize: '24px', fontStyle: '700', color: CORES.textoRoxo }).setOrigin(1, 0.5);
    const moeda = this.add.circle(w - 76, 28, 17, 0xffd23f).setStrokeStyle(3, 0xe8a10c);
    const estrela = this.add.star(w - 76, 28, 5, 6, 12, 0xe8a10c);
    this.hud.add([moeda, estrela, this.moedas]);
    if (sessao.usuario) {
      this.hud.add(new Botao(this, w - 145, 28, TEXTOS_CONTAS.sair, () => {
        if (this.dialogo.aberto) return;
        void sairDaConta().then(() => { this.parque.scene.stop(); this.scene.start('Entrar') })
          .catch(() => { this.aviso.setText(TEXTOS_CONTAS.falhaSair).setVisible(true) });
      }, { tamanho: 16, largura: 60 }));
      this.apelido = this.add.text(16, 58, sessao.apelido, { fontFamily: FONTE, fontSize: '16px', color: CORES.textoRoxo });
      this.hud.add(this.apelido);
    } else this.apelido = undefined;
    const yObjetivo = sessao.usuario && l.retrato ? 82 : 57;
    this.objetivo = this.add.text(16, yObjetivo, this.parque.objetivoAtual, { fontFamily: FONTE, fontSize: l.retrato || h < 500 ? '16px' : '18px', fontStyle: '600', color: CORES.textoRoxo, wordWrap: { width: w - 32 } });
    if (sessao.usuario && !l.retrato) this.apelido?.setPosition(180, 18);
    this.hud.add(this.objetivo);
    const paginas = Math.ceil(DESTINOS.length / l.porPagina);
    this.pagina = Math.min(this.pagina, paginas - 1);
    const y = h - l.rodape / 2 + 8;
    this.hud.add(this.add.text(w / 2, h - l.rodape + 8, 'Explore o parque', { fontFamily: FONTE, fontSize: '14px', color: CORES.textoRoxo }).setOrigin(0.5, 0));
    if (paginas > 1) {
      this.hud.add(new Botao(this, 23, y, '<', () => { this.pagina = (this.pagina - 1 + paginas) % paginas; this.reconstruir() }, { tamanho: 18, largura: 44 }));
      this.hud.add(new Botao(this, w - 23, y, '>', () => { this.pagina = (this.pagina + 1) % paginas; this.reconstruir() }, { tamanho: 18, largura: 44 }));
    }
    const margem = paginas > 1 ? 52 : 12;
    const itens = DESTINOS.slice(this.pagina * l.porPagina, (this.pagina + 1) * l.porPagina);
    const passo = (w - margem * 2) / itens.length;
    itens.forEach((item, i) => this.hud.add(new Botao(this, margem + passo * (i + 0.5), y, item.nome,
      () => this.parque.irPara(item.alvo), { tamanho: 16, largura: passo - 8 })));
    this.aviso = this.add.text(w / 2, h - l.rodape - 10, '', { fontFamily: FONTE, fontSize: '15px', color: CORES.textoRoxo, backgroundColor: '#ffffff', wordWrap: { width: w - 32 }, align: 'center', padding: { x: 8, y: 6 } }).setOrigin(0.5, 1);
    this.hud.add(this.aviso);
    this.dialogo.reorganizar();
  }

  definirObjetivo(texto: string): void { this.objetivo?.setText(texto) }
  update(): void {
    if (!this.moedas) return;
    this.apelido?.setText(sessao.apelido);
    this.aviso.setText(sessao.pendente ? TEXTOS_CONTAS.semInternet : '').setVisible(sessao.pendente);
    if (this.saldo !== progresso.moedas) {
      const inicio = this.saldo, fim = progresso.moedas; this.saldo = fim;
      this.contagem?.remove(); let atual = inicio;
      if (fim <= inicio || fim - inicio > 100) this.moedas.setText(String(fim));
      else this.contagem = this.time.addEvent({ delay: 70, repeat: fim - inicio - 1, callback: () => {
        this.moedas.setText(String(++atual));
        this.tweens.add({ targets: this.moedas, scale: 1.18, duration: 100, yoyo: true });
      } });
    }
  }
}
