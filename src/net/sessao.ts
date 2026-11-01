import type { Database } from './banco.types';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { carregar, persistir, progresso, usarProgresso, type Armazenamento } from '../game/estado';
import { amigos } from './sala';
import { supabase } from './supabase';
import { FilaSincronizacao, IDS_CABELOS, mesclar, type DadosNuvem, type NovaOperacao, type Operacao, type PortaNuvem } from './sincronizar';

export const sessao = { usuario: null as string | null, apelido: '', pendente: false };
let fila: FilaSincronizacao | null = null;
let geracao = 0;
let repeticao: ReturnType<typeof setInterval> | null = null;
const ouvintes = new Set<() => void>();
function avisar(): void { ouvintes.forEach(ouvinte => ouvinte()) }
export function observarSessao(ouvinte: () => void): () => void { ouvintes.add(ouvinte); return () => ouvintes.delete(ouvinte) }
function armazenamento(): Armazenamento | null { try { return localStorage } catch { return null } }
function erro(resultado: { error: unknown }): void { if (resultado.error) throw resultado.error }

export function criarPorta(cliente: SupabaseClient<Database>, usuario: string): PortaNuvem {
  return {
    async carregar(): Promise<DadosNuvem> {
      const [perfil, avatar, progressoServidor] = await Promise.all([
        cliente.from('profiles').select('moedas,apelido').eq('id', usuario).single(),
        cliente.from('avatars').select('cabelo').eq('user_id', usuario).eq('principal', true).maybeSingle(),
        cliente.from('progress').select('mission_id,status').eq('user_id', usuario),
      ]);
      erro(perfil); erro(avatar); erro(progressoServidor);
      return { moedas: Number(perfil.data!.moedas), apelido: String(perfil.data!.apelido),
        cabelo: avatar.data ? String(avatar.data.cabelo) : null,
        concluidas: (progressoServidor.data ?? []).filter(p => p.status === 'concluida').map(p => String(p.mission_id)) };
    },
    async executar(op: Operacao): Promise<number | null> {
      if (op.tipo === 'cabelo') {
        const resposta = await cliente.from('avatars').update({ cabelo: IDS_CABELOS[op.cabelo] })
          .eq('user_id', usuario).eq('principal', true).select('id').single();
        erro(resposta); return null;
      }
      if (op.tipo === 'concluir') {
        const resposta = await cliente.rpc('concluir_missao', { p_mission_id: op.missao, p_escolhas: op.escolhas });
        erro(resposta);
        if (typeof resposta.data !== 'number' || !Number.isInteger(resposta.data) || resposta.data < 0) throw new Error('Saldo inválido');
        return Number(resposta.data);
      }
      const consulta = () => cliente.from('progress').select('status').eq('user_id', usuario).eq('mission_id', op.missao).maybeSingle();
      const existente = await consulta(); erro(existente);
      if (existente.data && existente.data.status !== 'em_andamento') return null;
      const resposta = await cliente.from('progress').upsert({ user_id: usuario, mission_id: op.missao, status: 'em_andamento', escolhas: op.escolhas }, { onConflict: 'user_id,mission_id' });
      if (resposta.error) {
        // Outra aba pode ter concluído a missão entre a consulta e o upsert.
        const atual = await consulta(); erro(atual);
        if (atual.data && atual.data.status !== 'em_andamento') return null;
        throw resposta.error;
      }
      return null;
    },
  };
}

function limpar(): void {
  amigos.esquecer();
  geracao++; fila?.parar(); fila = null;
  if (repeticao) clearInterval(repeticao);
  repeticao = null;
}

export async function entrarNaConta(usuario: User): Promise<void> {
  if (!supabase) return;
  limpar(); const versao = geracao;
  const salvo = carregar(armazenamento(), `mtmw:conta:v1:${usuario.id}`);
  usarProgresso(salvo, usuario.id);
  sessao.usuario = usuario.id; sessao.apelido = 'Jogador'; sessao.pendente = false;
  const porta = criarPorta(supabase, usuario.id);
  const novaFila = new FilaSincronizacao(usuario.id, armazenamento(), porta,
    saldo => { if (geracao === versao) { progresso.moedas = saldo; persistir(); avisar() } },
    pendente => { if (geracao === versao) { sessao.pendente = pendente; avisar() } });
  fila = novaFila;
  try {
    const remoto = await porta.carregar();
    if (geracao !== versao) return;
    usarProgresso(mesclar(salvo, remoto, novaFila.pendentes()), usuario.id);
    sessao.apelido = remoto.apelido;
  } catch { if (geracao === versao) sessao.pendente = true }
  if (geracao !== versao) return;
  avisar();
  // Enquanto a leitura inicial estiver indisponível, não apaga o aviso de pendência.
  const retomar = async (): Promise<void> => {
    try {
      const remoto = await porta.carregar();
      if (geracao !== versao) return;
      usarProgresso(mesclar(progresso, remoto, novaFila.pendentes()), usuario.id);
      sessao.apelido = remoto.apelido;
      await novaFila.enviar();
      if (geracao === versao) avisar();
    } catch { if (geracao === versao) { sessao.pendente = true; avisar() } }
  };
  repeticao = setInterval(() => { void retomar() }, 15_000);
  if (!sessao.pendente) await novaFila.enviar();
}

export function registrar(op: NovaOperacao): void { fila?.adicionar(op) }
export function jogarOffline(): void {
  limpar(); usarProgresso(carregar(), null);
  Object.assign(sessao, { usuario: null, apelido: '', pendente: false }); avisar();
}
export async function sairDaConta(): Promise<void> {
  if (supabase) { const resultado = await supabase.auth.signOut({ scope: 'local' }); erro(resultado) }
  jogarOffline();
}
