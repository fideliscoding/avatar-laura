import Phaser from 'phaser';
import { CORES, FONTE } from '../config/assets';
import { TEXTOS_CONTAS as T } from '../config/contas';
import { validarApelido } from '../game/apelido';
import { entrarNaConta, jogarOffline } from '../net/sessao';
import { supabase } from '../net/supabase';
import { Botao } from '../ui/Botao';

/** A autenticação pertence ao adulto; e-mail e senha nunca vão para tabelas do jogo. */
export class CenaEntrar extends Phaser.Scene {
  private formulario!: Phaser.GameObjects.DOMElement;
  private aviso!: Phaser.GameObjects.Text;
  private cadastro = false;
  private ocupado = false;
  private versao = 0;
  private acao?: Botao;
  private alternar?: Botao;

  constructor() { super('Entrar') }

  create(): void {
    this.cadastro = false; this.ocupado = false; const versao = ++this.versao;
    this.events.once('shutdown', () => { this.versao++ });
    this.add.rectangle(640, 360, 1280, 720, 0xeadfff);
    this.add.text(640, 80, T.titulo, { fontFamily: FONTE, fontSize: '44px', color: CORES.textoRoxo, fontStyle: '700' }).setOrigin(0.5);
    this.add.text(640, 144, T.explicacao, { fontFamily: FONTE, fontSize: '24px', color: CORES.textoEscuro }).setOrigin(0.5);
    this.formulario = this.add.dom(640, 330).createFromHTML(`
      <form aria-label="${T.titulo}" style="width:440px;display:grid;gap:12px;font:20px Fredoka,sans-serif;color:#5a2fa8">
        <label>${T.email}<input name="email" type="email" autocomplete="email" maxlength="254" required style="box-sizing:border-box;display:block;width:100%;padding:10px;border:2px solid #b58cf5;border-radius:12px;font:20px Fredoka,sans-serif"></label>
        <label>${T.senha}<input name="senha" type="password" autocomplete="current-password" minlength="8" maxlength="128" required style="box-sizing:border-box;display:block;width:100%;padding:10px;border:2px solid #b58cf5;border-radius:12px;font:20px Fredoka,sans-serif"></label>
        <label data-apelido hidden>${T.apelido}<input name="apelido" type="text" autocomplete="off" maxlength="20" style="box-sizing:border-box;display:block;width:100%;padding:10px;border:2px solid #b58cf5;border-radius:12px;font:20px Fredoka,sans-serif"></label>
        <button type="submit" hidden>Entrar</button>
      </form>`);
    this.formulario.node.addEventListener('submit', evento => { evento.preventDefault(); void this.enviar() });
    this.aviso = this.add.text(640, 474, '', { fontFamily: FONTE, fontSize: '20px', color: CORES.textoRoxo, align: 'center', wordWrap: { width: 1000 } }).setOrigin(0.5);
    this.montarBotoes();
    new Botao(this, 640, 640, T.offline, () => {
      if (this.ocupado) return;
      jogarOffline(); this.scene.start('Criador');
    }, { tamanho: 24, estilo: 'rosa' });
    if (supabase) {
      void supabase.auth.getSession().then(async ({ data, error }) => {
        if (versao !== this.versao || this.ocupado || error || !data.session) return;
        this.ocupado = true; this.aviso.setText(T.trabalhando);
        await entrarNaConta(data.session.user);
        if (versao === this.versao) this.scene.start('Criador');
      }).catch(() => { if (versao === this.versao) this.aviso.setText(T.falha) });
    }
  }

  private montarBotoes(): void {
    this.acao?.destroy(); this.alternar?.destroy();
    this.acao = new Botao(this, 450, 550, this.cadastro ? T.criar : T.entrar, () => { void this.enviar() }, { tamanho: 24 });
    this.alternar = new Botao(this, 790, 550, this.cadastro ? T.voltar : T.criar, () => {
      if (this.ocupado) return;
      this.cadastro = !this.cadastro;
      (this.formulario.node.querySelector('[data-apelido]') as HTMLElement).hidden = !this.cadastro;
      this.campo('senha').autocomplete = this.cadastro ? 'new-password' : 'current-password';
      this.aviso.setText(''); this.montarBotoes();
    }, { tamanho: 24 });
  }

  private campo(nome: string): HTMLInputElement { return this.formulario.node.querySelector(`input[name="${nome}"]`)! }

  private async enviar(): Promise<void> {
    if (this.ocupado || !supabase) return;
    const email = this.campo('email'), senha = this.campo('senha').value;
    if (!email.value || !email.checkValidity()) { this.aviso.setText(T.emailInvalido); return }
    if (senha.length < 8) { this.aviso.setText(T.senhaCurta); return }
    const apelido = validarApelido(this.campo('apelido').value);
    if (this.cadastro && !apelido) { this.aviso.setText(T.apelidoInvalido); return }
    this.ocupado = true; this.aviso.setText(T.trabalhando);
    const versao = this.versao;
    try {
      const resposta = this.cadastro
        ? await supabase.auth.signUp({ email: email.value.trim(), password: senha, options: { data: { apelido }, emailRedirectTo: new URL(import.meta.env.BASE_URL, location.origin).href } })
        : await supabase.auth.signInWithPassword({ email: email.value.trim(), password: senha });
      if (resposta.error) throw resposta.error;
      if (versao !== this.versao) return;
      this.campo('senha').value = '';
      if (resposta.data.session) {
        await entrarNaConta(resposta.data.session.user);
        if (versao === this.versao) this.scene.start('Criador');
      } else {
        this.cadastro = false;
        (this.formulario.node.querySelector('[data-apelido]') as HTMLElement).hidden = true;
        this.campo('senha').autocomplete = 'current-password';
        this.aviso.setText(T.confirme);
        this.montarBotoes();
      }
    } catch { if (versao === this.versao) this.aviso.setText(this.cadastro ? T.falhaCadastro : T.falha) }
    finally { if (versao === this.versao) this.ocupado = false }
  }
}
