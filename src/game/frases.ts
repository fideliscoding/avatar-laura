/** Toda comunicação textual entre amigos usa somente estes identificadores. */
export const FRASES = [
  { id: 'oi', texto: 'Oi!' }, { id: 'brincar', texto: 'Vamos brincar?' },
  { id: 'balanco', texto: 'Vamos no balanço?' }, { id: 'obrigado', texto: 'Obrigado!' },
  { id: 'muito-bem', texto: 'Muito bem!' }, { id: 'desculpa', texto: 'Desculpa!' },
  { id: 'tchau', texto: 'Tchau!' },
] as const;
export function obterFrase(id: unknown): typeof FRASES[number] | null {
  return FRASES.find(frase => frase.id === id) ?? null;
}
