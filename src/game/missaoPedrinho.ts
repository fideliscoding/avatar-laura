import dados from '../../public/data/missoes/pedrinho-carrinho.json' with { type: 'json' };
import { avancarMissao, iniciarMissao } from './missoes/motor';
import type { ExecucaoMissao } from './missoes/tipos';
// Logica pura (sem Phaser) da missao "O carrinho do Pedrinho". Testada em tests/missaoPedrinho.test.ts.
// Valor ensinado: honestidade e empatia (devolver o que nao e seu, pensar em como o outro se sente).

export type Etapa = 'inicio' | 'procurando' | 'escolhendo' | 'concluida';
export type Opcao = 'A' | 'B' | 'C';

export const RECOMPENSA_MOEDAS = dados.recompensa;
export const TEXTOS = dados.textos;

export interface EstadoMissao { etapa: Etapa; tentativasErradas: number }

export function novaMissao(): EstadoMissao { return adaptar(iniciarMissao(dados)) }
function adaptar(s:ExecucaoMissao):EstadoMissao{return {etapa:s.passo as Etapa,tentativasErradas:s.tentativasErradas}}
function execucao(s:EstadoMissao):ExecucaoMissao{return {...iniciarMissao(dados),passo:s.etapa,tentativasErradas:s.tentativasErradas,concluida:s.etapa==='concluida'}}

/** Conversar com o Pedrinho e aceitar ajudar. */
export function aceitarAjuda(s: EstadoMissao): EstadoMissao {
  return s.etapa === 'inicio' ? adaptar(avancarMissao(dados,execucao(s),'ajudar').estado) : s;
}

/** Cavar na areia. So encontra o carrinho se a missao ja foi aceita ou ainda nao concluida. */
export function cavarAreia(s: EstadoMissao): { estado: EstadoMissao; achou: boolean } {
  if (s.etapa === 'concluida') return { estado: s, achou: false };
  return { estado: adaptar(avancarMissao(dados,{...execucao(s),passo:'procurando'},'cavar').estado), achou: true };
}

export interface ResultadoEscolha { estado: EstadoMissao; moedas: number; conselho: string | null }

/** A e C nao punem: mostram um conselho gentil da Dona Marta e voltam para a escolha. So B conclui. */
export function escolher(s: EstadoMissao, o: Opcao): ResultadoEscolha {
  const estado=execucao(s);
  const resultado = avancarMissao(dados, estado, o);
  return { estado: { etapa: resultado.estado.passo as Etapa, tentativasErradas: resultado.estado.tentativasErradas }, moedas: resultado.moedas, conselho: resultado.conselho };
}
