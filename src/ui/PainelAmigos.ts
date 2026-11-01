import Phaser from 'phaser';
import { amigos } from '../net/sala';
import { FRASES } from '../game/frases';
import { LIMITE_SALA, podeAprovar } from '../game/regrasSala';
import { TEXTOS_AMIGOS as T } from '../config/amigos';

type Acao = { frase(id: string): void; gesto(tipo: 'aceno' | 'pulo' | 'coracao'): void; ver(usuario: string): void; fechar(): void };

/** Painel acessível, com código privado e botões fixos; não há campo de mensagem. */
export class PainelAmigos {
  aberto = false;
  private elemento: Phaser.GameObjects.DOMElement;
  private bloqueio: Phaser.GameObjects.Zone;
  private root: HTMLElement;
  private estado: HTMLElement;
  private lista: HTMLElement;
  private codigo: HTMLInputElement;
  private aviso: HTMLElement;
  private ultimo = '';
  private ocupado = false;
  private modo: 'sala' | 'frases' | 'gestos' = 'sala';
  private confirmando: string | null = null;

  constructor(private cena: Phaser.Scene, private acao: Acao) {
    this.bloqueio = cena.add.zone(0,0,1,1).setOrigin(0).setInteractive().setDepth(9000).setVisible(false);
    this.bloqueio.on('pointerdown', (_p: unknown,_x: unknown,_y: unknown,event: Phaser.Types.Input.EventData) => event.stopPropagation());
    this.root = document.createElement('section'); this.root.setAttribute('aria-label',T.titulo);
    this.root.style.cssText = 'box-sizing:border-box;overflow:auto;overscroll-behavior:contain;touch-action:pan-y;background:#fff9ff;color:#5a2fa8;border:4px solid #b58cf5;border-radius:24px;padding:16px;font:17px Fredoka,sans-serif;box-shadow:0 10px 35px #3d247060;';
    const titulo = document.createElement('h2'); titulo.textContent = T.titulo; titulo.style.cssText='margin:0 0 8px;font-size:28px'; this.root.append(titulo);
    const guia = document.createElement('p'); guia.textContent=T.explicacao; guia.style.margin='0 0 12px'; this.root.append(guia);
    const abas = document.createElement('div'); abas.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px';
    for (const [modo,texto] of [['sala',T.areaAdulto],['frases',T.frases],['gestos',T.gestos]] as const) abas.append(this.botao(texto, () => { this.modo=modo; this.ultimo=''; this.atualizar() }));
    this.root.append(abas);
    this.estado=document.createElement('p'); this.estado.setAttribute('role','status'); this.root.append(this.estado);
    this.codigo=document.createElement('input'); this.codigo.setAttribute('aria-label',T.codigo); this.codigo.placeholder=T.codigo;
    this.codigo.maxLength=6; this.codigo.autocomplete='off'; this.codigo.autocapitalize='characters';
    this.codigo.style.cssText='box-sizing:border-box;width:100%;min-height:48px;border:2px solid #b58cf5;border-radius:12px;font:22px Fredoka,sans-serif;padding:8px;letter-spacing:4px;text-transform:uppercase;';
    this.codigo.addEventListener('input', () => { this.codigo.value=this.codigo.value.replace(/[^a-z]/gi,'').toUpperCase() });
    this.root.append(this.codigo);
    this.lista=document.createElement('div'); this.lista.style.cssText='display:grid;gap:10px;margin:12px 0;'; this.root.append(this.lista);
    this.aviso=document.createElement('p'); this.aviso.setAttribute('role','status'); this.root.append(this.aviso);
    this.root.append(this.botao(T.fechar, () => this.fechar(), true));
    this.elemento=cena.add.dom(0,0,this.root).setDepth(9001).setVisible(false);
  }
  private botao(texto: string, aoClicar: () => void, permitirOcupado = false): HTMLButtonElement {
    const botao=document.createElement('button'); botao.type='button'; botao.textContent=texto;
    botao.style.cssText='min-height:46px;border:0;border-radius:16px;padding:9px 14px;font:600 16px Fredoka,sans-serif;color:white;background:#8b55e6;cursor:pointer;touch-action:manipulation;';
    botao.addEventListener('click', () => { if (!this.ocupado || permitirOcupado) aoClicar() }); return botao;
  }
  private async executar(acao: () => Promise<void>): Promise<void> {
    if (this.ocupado) return;
    this.ocupado=true; this.aviso.textContent=T.conectando;
    try { await acao(); this.aviso.textContent='' }
    catch (erro) { this.aviso.textContent=erro instanceof Error && [T.cheia,T.codigoInvalido,T.semConta].some(m=>m===erro.message) ? erro.message : T.falha }
    finally { this.ocupado=false; this.ultimo=''; this.atualizar() }
  }
  abrir(): void { this.aberto=true; this.modo='sala'; this.ultimo=''; this.bloqueio.setVisible(true); this.elemento.setVisible(true); this.root.style.display='block'; this.reorganizar(); this.atualizar() }
  fechar(): void { this.aberto=false; this.elemento.setVisible(false); this.root.style.display='none'; this.bloqueio.setVisible(false); this.acao.fechar() }
  reorganizar(): void {
    const w=this.cena.scale.width,h=this.cena.scale.height;
    this.root.style.width=`${Math.min(560,w-20)}px`; this.root.style.maxHeight=`${h-20}px`;
    this.elemento.updateSize(); this.elemento.setPosition(w/2,h/2); this.bloqueio.setSize(w,h);
    if (this.bloqueio.input) this.bloqueio.input.hitArea.setTo(0,0,w,h);
  }
  atualizar(): void {
    if (!this.aberto) return;
    const assinatura=JSON.stringify([this.modo,amigos.sala,amigos.fase,amigos.membros,[...amigos.remotos.keys()],this.confirmando]);
    if (assinatura===this.ultimo) return; this.ultimo=assinatura;
    this.lista.replaceChildren(); this.codigo.hidden=this.modo!=='sala' || !amigos.usuario || !!amigos.sala;
    this.estado.textContent=amigos.fase==='conectado' ? T.conectado : amigos.fase==='aguardando' ? T.aguardando : amigos.fase==='reconectando' ? T.reconectando : amigos.fase==='conectando' ? T.conectando : amigos.aviso || T.sozinho;
    if (this.modo==='frases') {
      this.estado.textContent=T.fraseTitulo;
      if (amigos.fase!=='conectado') this.lista.textContent=T.aguardando;
      else for (const frase of FRASES) this.lista.append(this.botao(frase.texto, () => { this.acao.frase(frase.id); this.fechar() }));
    } else if (this.modo==='gestos') {
      this.estado.textContent=T.gestoTitulo;
      if (amigos.fase!=='conectado') this.lista.textContent=T.aguardando;
      else for (const [tipo,texto] of [['aceno',T.aceno],['pulo',T.pulo],['coracao',T.coracao]] as const) this.lista.append(this.botao(texto, () => { this.acao.gesto(tipo); this.fechar() }));
    } else if (!amigos.usuario) this.lista.textContent=T.semConta;
    else if (!amigos.sala) {
      this.lista.append(this.botao(T.criar, () => { void this.executar(() => amigos.criar()) }));
      this.lista.append(this.botao(T.entrar, () => { void this.executar(() => amigos.pedir(this.codigo.value)) }));
    } else {
      const sala=amigos.sala, dono=sala.dono_id===amigos.usuario;
      const codigo=document.createElement('strong'); codigo.textContent=`${T.codigoSala}: ${sala.codigo}`; codigo.style.cssText='font-size:26px;letter-spacing:3px'; this.lista.append(codigo);
      const quantidade=amigos.membros.filter(m=>m.aprovado).length;
      const resumo=document.createElement('p'); resumo.textContent=`${T.aprovados}: ${quantidade}/${LIMITE_SALA}`; this.lista.append(resumo);
      for (const membro of amigos.membros) {
        const linha=document.createElement('div'); linha.style.cssText='display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap';
        const nome=document.createElement('span'); nome.textContent=membro.apelido; linha.append(nome);
        if (!membro.aprovado && dono) {
          if (this.confirmando===membro.user_id) {
            const texto=document.createElement('span'); texto.textContent=T.confirmar; linha.append(texto);
            linha.append(this.botao(T.confirmarBotao, () => { this.confirmando=null; void this.executar(() => amigos.aprovar(membro.user_id)) }));
          } else {
            const botao=this.botao(T.aprovar, () => { this.confirmando=membro.user_id; this.ultimo=''; this.atualizar() });
            botao.disabled=!podeAprovar(dono,quantidade); linha.append(botao);
          }
        } else if (membro.user_id!==amigos.usuario && amigos.remotos.has(membro.user_id)) linha.append(this.botao(T.ver, () => { this.acao.ver(membro.user_id); this.fechar() }));
        this.lista.append(linha);
      }
      if (dono && !amigos.membros.some(m=>!m.aprovado)) { const vazio=document.createElement('p'); vazio.textContent=T.semPedidos; this.lista.append(vazio) }
      this.lista.append(this.botao(dono ? T.encerrar : T.sair, () => { void this.executar(() => amigos.sair()) }));
    }
    this.reorganizar();
  }
  destruir(): void { this.aberto=false; this.elemento.destroy(); this.bloqueio.destroy() }
}
