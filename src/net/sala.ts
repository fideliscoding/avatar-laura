import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { obterFrase } from '../game/frases';
import { acenoValido, deveEnviar, normalizarCodigo, validarEstadoRemoto, type Aceno, type EstadoCompartilhado, type UltimoEnvio } from '../game/regrasSala';
import { validarApelido } from '../game/apelido';
import { TEXTOS_AMIGOS as T } from '../config/amigos';

export interface Sala { id: string; codigo: string; dono_id: string; ativa: boolean; versao: number }
export interface Membro { user_id: string; apelido: string; cabelo: string; aprovado: boolean }
export interface Remoto { membro: Membro; estado: EstadoCompartilhado }
export type EventoSocial = { tipo: 'frase'; id: string } | { tipo: 'aceno'; aceno: Aceno };
export type FaseSala = 'sozinho' | 'aguardando' | 'conectando' | 'conectado' | 'reconectando';

function salaValida(dados: unknown): Sala {
  const valor = Array.isArray(dados) ? dados[0] : dados;
  if (!valor || typeof valor !== 'object') throw new Error(T.falha);
  const s = valor as Sala;
  if (typeof s.id !== 'string' || typeof s.dono_id !== 'string' || !normalizarCodigo(s.codigo) || !Number.isInteger(s.versao)) throw new Error(T.falha);
  return s;
}

/** Uma conexão WebSocket, com canais privados vinculados à identidade de cada autor. */
export class AmigosSala {
  sala: Sala | null = null;
  membros: Membro[] = [];
  remotos = new Map<string, Remoto>();
  fase: FaseSala = 'sozinho';
  aviso = '';
  usuario: string | null = null;
  aoEvento?: (usuario: string, evento: EventoSocial) => void;
  private canais = new Map<string, RealtimeChannel>();
  private controle?: RealtimeChannel;
  private prontos = new Set<string>();
  private chave = '';
  private geracao = 0;
  private ativa = false;
  private consultando = false;
  private repeticao?: ReturnType<typeof setInterval>;
  private ultimo: UltimoEnvio | null = null;
  private ultimoGesto = -Infinity;
  private ultimoEstadoEnviado = ''; 
  private recebidos = new Map<string, number>();
  private nome = '';
  private local: EstadoCompartilhado = { x: 470, y: 640, cabelo: 'liso', estado: 'parada', angulo: 0, origemY: 1, sx: 1, sy: 1, z: 640 };

  configurar(usuario: string | null, nome: string): void {
    if (usuario !== this.usuario) this.esquecer();
    this.usuario = usuario; this.nome = nome; this.ativa = true;
    if (this.sala) { this.iniciarConsulta(); void this.atualizar() }
  }
  pausar(): void {
    this.ativa = false; this.fecharCanais(); this.aoEvento = undefined;
    if (this.repeticao) clearInterval(this.repeticao); this.repeticao = undefined;
  }
  esquecer(): void { this.pausar(); this.sala = null; this.membros = []; this.usuario = null; this.fase = 'sozinho'; this.aviso = '' }
  private exigirConta(): asserts this is this & { usuario: string } { if (!supabase || !this.usuario) throw new Error(T.semConta) }
  private iniciarConsulta(): void {
    if (!this.repeticao) this.repeticao = setInterval(() => { void this.atualizar() }, 2000);
  }
  async criar(): Promise<void> {
    this.exigirConta(); const usuario = this.usuario;
    const resultado = await supabase!.rpc('criar_sala');
    if (resultado.error) throw resultado.error;
    if (this.usuario !== usuario || !this.ativa) return;
    this.sala = salaValida(resultado.data); this.iniciarConsulta(); await this.atualizar();
  }
  async pedir(codigo: string): Promise<void> {
    this.exigirConta(); const normalizado = normalizarCodigo(codigo);
    if (!normalizado) throw new Error(T.codigoInvalido);
    const usuario = this.usuario;
    const resultado = await supabase!.rpc('entrar_na_sala', { p_codigo: normalizado });
    if (resultado.error) throw resultado.error;
    if (this.usuario !== usuario || !this.ativa) return;
    this.sala = salaValida(resultado.data); this.iniciarConsulta(); await this.atualizar();
  }
  async aprovar(usuario: string): Promise<void> {
    this.exigirConta(); if (!this.sala) return;
    const resposta = await supabase!.rpc('aprovar_membro', { p_sala: this.sala.id, p_usuario: usuario });
    if (resposta.error) throw new Error(resposta.error.message.includes('sala cheia') ? T.cheia : T.falha);
    await this.atualizar();
  }
  async sair(): Promise<void> {
    if (this.sala && supabase && this.usuario) {
      const resultado = await supabase.rpc('sair_da_sala', { p_sala: this.sala.id });
      if (resultado.error) throw resultado.error;
    }
    const usuario = this.usuario, nome = this.nome;
    this.esquecer(); this.configurar(usuario, nome);
  }

  async atualizar(): Promise<void> {
    if (!this.ativa || !this.sala || !this.usuario || !supabase || this.consultando) return;
    const id = this.sala.id, usuario = this.usuario; this.consultando = true;
    try {
      const [consulta, pedido] = await Promise.all([
        supabase.rpc('consultar_sala', { p_sala: id }),
        supabase.from('room_members').select('aprovado').eq('room_id', id).eq('user_id', usuario).maybeSingle(),
      ]);
      if (!this.ativa || this.usuario !== usuario || this.sala?.id !== id) return;
      if (consulta.error || pedido.error) throw consulta.error ?? pedido.error;
      const sala = salaValida(consulta.data);
      if (!sala.ativa || !pedido.data) { this.fecharCanais(); this.sala = null; this.membros = []; this.fase = 'sozinho'; this.aviso = T.fechada; return }
      this.sala = sala;
      if (!pedido.data.aprovado) { this.fecharCanais(); this.fase = 'aguardando'; this.membros = []; return }
      const resposta = await supabase.rpc('listar_membros_sala', { p_sala: id });
      if (resposta.error) throw resposta.error;
      if (!this.ativa || this.usuario !== usuario || this.sala?.id !== id) return;
      this.membros = (resposta.data ?? []).filter(m => validarApelido(m.apelido) !== null);
      const chave = `${id}:${sala.versao}`;
      if (this.chave !== chave) await this.abrirCanais(chave);
      else if (this.prontos.size === this.canais.size + 1) this.fase = 'conectado';
    } catch { if (this.ativa && this.usuario === usuario) this.fase = 'reconectando' }
    finally { this.consultando = false }
  }

  private fecharCanais(): void {
    this.geracao++; this.chave = ''; this.prontos.clear(); this.remotos.clear(); this.ultimo = null; this.ultimoEstadoEnviado = ''; 
    for (const canal of this.canais.values()) void supabase?.removeChannel(canal);
    if (this.controle) void supabase?.removeChannel(this.controle);
    this.canais.clear(); this.controle = undefined;
  }
  private async abrirCanais(chave: string): Promise<void> {
    if (!supabase || !this.usuario || !this.sala) return;
    this.fecharCanais(); this.fase = 'conectando';
    const geracao = this.geracao, usuario = this.usuario;
    const atual = () => this.ativa && this.geracao === geracao && this.usuario === usuario;
    const sessao = await supabase.auth.getSession();
    if (!atual()) return;
    if (!sessao.data.session) { this.fase = 'reconectando'; return }
    await supabase.realtime.setAuth(sessao.data.session.access_token);
    if (!atual()) return;
    this.chave = chave;
    const aprovados = this.membros.filter(m => m.aprovado);
    const status = (id: string, valor: string) => {
      if (!atual()) return;
      if (valor === 'SUBSCRIBED') this.prontos.add(id);
      else { this.prontos.delete(id); this.fase = 'reconectando'; this.remotos.delete(id) }
      if (this.prontos.size === aprovados.length + 1) this.fase = 'conectado';
    };
    this.controle = supabase.channel(`sala:${this.sala.id}`, { config: { private: true, presence: { key: usuario } } })
      .on('broadcast', { event: 'sala_alterada' }, () => { if (atual()) void this.atualizar() })
      .subscribe(valor => status('controle', valor));
    for (const membro of aprovados) {
      const canal = supabase.channel(`sala:${chave}:${membro.user_id}`, { config: { private: true, presence: { key: membro.user_id }, broadcast: { ack: true, self: false } } });
      const receber = (dados: unknown) => {
        if (!atual() || membro.user_id === usuario) return;
        const estado = validarEstadoRemoto(dados);
        if (estado) this.remotos.set(membro.user_id, { membro, estado });
      };
      canal.on('presence', { event: 'sync' }, () => {
        if (!atual() || membro.user_id === usuario) return;
        const estados = Object.values(canal.presenceState()).flat();
        if (!estados.length) this.remotos.delete(membro.user_id);
        else receber(estados[estados.length - 1]);
      }).on('broadcast', { event: 'mover' }, ({ payload }) => receber(payload))
        .on('broadcast', { event: 'brinquedo' }, ({ payload }) => {
          if (payload && ['balanco','escorregador','gangorra','carrossel'].includes(payload.estado)) receber(payload);
        })
        .on('broadcast', { event: 'frase' }, ({ payload }) => {
          const frase = obterFrase(payload?.id);
          if (frase && atual()) this.receberEvento(membro.user_id, { tipo: 'frase', id: frase.id });
        }).on('broadcast', { event: 'aceno' }, ({ payload }) => {
          if (acenoValido(payload?.tipo) && atual()) this.receberEvento(membro.user_id, { tipo: 'aceno', aceno: payload.tipo });
        }).subscribe(valor => {
          status(membro.user_id, valor);
          if (atual() && valor === 'SUBSCRIBED' && membro.user_id === usuario) void canal.track({ ...this.local, user_id: usuario, apelido: this.nome });
        });
      this.canais.set(membro.user_id, canal);
    }
  }

  publicar(estado: EstadoCompartilhado, agora: number): void {
    const cabeloMudou = estado.cabelo !== this.local.cabelo;
    this.local = estado;
    if (this.fase !== 'conectado' || !this.usuario) return;
    const canal = this.canais.get(this.usuario); if (!canal || canal.state !== 'joined') return;
    const assinatura = JSON.stringify({ ...estado, x: Math.round(estado.x), y: Math.round(estado.y), sx: Math.round(estado.sx * 100) / 100, sy: Math.round(estado.sy * 100) / 100 });
    if (deveEnviar(this.ultimo, agora, assinatura)) {
      this.ultimo = { instante: agora, assinatura };
      void canal.send({ type: 'broadcast', event: estado.estado !== this.ultimoEstadoEnviado && ['balanco','escorregador','gangorra','carrossel'].includes(estado.estado) ? 'brinquedo' : 'mover', payload: estado });
    }
    if (this.ultimo?.assinatura === assinatura) this.ultimoEstadoEnviado = estado.estado;
    if (cabeloMudou) void canal.track({ ...estado, user_id: this.usuario, apelido: this.nome });
  }
  enviarFrase(id: unknown): boolean { const frase = obterFrase(id); return frase ? this.enviarEvento({ tipo: 'frase', id: frase.id }) : false }
  enviarAceno(tipo: unknown): boolean { return acenoValido(tipo) ? this.enviarEvento({ tipo: 'aceno', aceno: tipo }) : false }
  private enviarEvento(evento: EventoSocial): boolean {
    if (this.fase !== 'conectado' || !this.usuario || performance.now() - this.ultimoGesto < 700) return false;
    const canal = this.canais.get(this.usuario); if (!canal || canal.state !== 'joined') return false;
    this.ultimoGesto = performance.now();
    void canal.send({ type: 'broadcast', event: evento.tipo, payload: evento.tipo === 'frase' ? { id: evento.id } : { tipo: evento.aceno } });
    this.aoEvento?.(this.usuario, evento); return true;
  }
  private receberEvento(usuario: string, evento: EventoSocial): void {
    if (usuario === this.usuario || !this.membros.some(m => m.user_id === usuario && m.aprovado)) return;
    const chave = `${usuario}:${evento.tipo}`, agora = performance.now();
    if (agora - (this.recebidos.get(chave) ?? -Infinity) < 500) return;
    this.recebidos.set(chave, agora); this.aoEvento?.(usuario, evento);
  }
}
export const amigos = new AmigosSala();
