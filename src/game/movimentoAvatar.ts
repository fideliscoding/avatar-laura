export type PoseAvatar = 'parada' | 'andar' | 'sentar' | 'escorregar' | 'acenar' | 'dancar';
export interface MovimentoAvatar { cabeca: number; bracoE: number; bracoD: number; pernaE: number; pernaD: number }

/** Articulação contínua das partes, independente da taxa de quadros e do cabelo. */
export function movimentoAvatar(pose: PoseAvatar, tempo: number, modelo: 'frontal' | 'recortes' = 'frontal'): MovimentoAvatar {
  const respiracao = Math.sin(tempo * 2.4);
  const movimento = { cabeca: respiracao * 1.4, bracoE: respiracao * 2, bracoD: -respiracao * 2, pernaE: 0, pernaD: 0 };
  if (pose === 'andar') {
    const passo = Math.sin(tempo * 10);
    return { cabeca: passo * 2, bracoE: -passo * 14, bracoD: passo * 14, pernaE: passo * 20, pernaD: -passo * 20 };
  }
  if (pose === 'sentar' || pose === 'escorregar') {
    const balanco = pose === 'sentar' ? Math.sin(tempo * 3) * 3 : 0;
    return { cabeca: respiracao * 2, bracoE: -18, bracoD: 18, pernaE: modelo==='frontal' ? 14 + balanco : -55 + balanco, pernaD: modelo==='frontal' ? -14 - balanco : -62 + balanco };
  }
  if (pose === 'acenar') movimento.bracoE = modelo==='frontal' ? 105 + Math.sin(tempo * 9) * 15 : -25 + Math.sin(tempo * 9) * 18;
  if (pose === 'dancar') return { cabeca: Math.sin(tempo * 6) * 7, bracoE: -35 + Math.sin(tempo * 9) * 24, bracoD: 35 - Math.sin(tempo * 9) * 24, pernaE: Math.sin(tempo * 8) * 16, pernaD: -Math.sin(tempo * 8) * 16 };
  return movimento;
}
