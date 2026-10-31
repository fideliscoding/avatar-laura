// Logica pura (sem Phaser) da missao "O carrinho do Pedrinho". Testada em tests/missaoPedrinho.test.ts.
// Valor ensinado: honestidade e empatia (devolver o que nao e seu, pensar em como o outro se sente).

export type Etapa = 'inicio' | 'procurando' | 'escolhendo' | 'concluida';
export type Opcao = 'A' | 'B' | 'C';

export const RECOMPENSA_MOEDAS = 15;

export const TEXTOS = {
  objetivoInicial: 'Toque no chão para andar. Ajude quem precisa!',
  objetivoProcurar: 'Procure o carrinho azul do Pedrinho. Será que está na areia?',
  objetivoConcluida: `Missão completa! Você devolveu o carrinho. +${RECOMPENSA_MOEDAS} moedas`,
  pedroPede: 'Perdi meu carrinho azul...',
  respostaAjudar: 'Eu te ajudo a procurar!',
  pergunta: 'Achei um carrinho azul na areia! O que você vai fazer?',
  opcoes: { A: 'A) Guardar pra mim', B: 'B) Devolver ao Pedrinho', C: 'C) Deixar ali' } as Record<Opcao, string>,
  conselhoA: 'Hmm... o Pedrinho está tristinho procurando o carrinho dele. Como será que ele se sente sem o brinquedo favorito?',
  conselhoC: 'Se o carrinho ficar na areia, o Pedrinho pode nunca encontrar. Será que tem um jeito de ajudar?',
  tentarDeNovo: 'Tentar de novo',
  pedroAgradece: 'Meu carrinho! Obrigado!',
  pedroAmiga: 'Obrigado, Laura! Você é uma amiga de verdade!',
  pedroDepois: 'Obrigado de novo, Laura! Vamos brincar no escorregador?',
  areiaDepois: 'Que areia fofinha!',
} as const;

export interface EstadoMissao { etapa: Etapa; tentativasErradas: number }

export function novaMissao(): EstadoMissao { return { etapa: 'inicio', tentativasErradas: 0 } }

/** Conversar com o Pedrinho e aceitar ajudar. */
export function aceitarAjuda(s: EstadoMissao): EstadoMissao {
  return s.etapa === 'inicio' ? { ...s, etapa: 'procurando' } : s;
}

/** Cavar na areia. So encontra o carrinho se a missao ja foi aceita ou ainda nao concluida. */
export function cavarAreia(s: EstadoMissao): { estado: EstadoMissao; achou: boolean } {
  if (s.etapa === 'concluida') return { estado: s, achou: false };
  return { estado: { ...s, etapa: 'escolhendo' }, achou: true };
}

export interface ResultadoEscolha { estado: EstadoMissao; moedas: number; conselho: string | null }

/** A e C nao punem: mostram um conselho gentil da Dona Marta e voltam para a escolha. So B conclui. */
export function escolher(s: EstadoMissao, o: Opcao): ResultadoEscolha {
  if (s.etapa !== 'escolhendo') return { estado: s, moedas: 0, conselho: null };
  if (o === 'B') return { estado: { ...s, etapa: 'concluida' }, moedas: RECOMPENSA_MOEDAS, conselho: null };
  return { estado: { ...s, tentativasErradas: s.tentativasErradas + 1 }, moedas: 0, conselho: o === 'A' ? TEXTOS.conselhoA : TEXTOS.conselhoC };
}
