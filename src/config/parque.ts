// Coordenadas do prototipo aprovado (palco 1280x720). Ver docs/ARTE.md.
export const PROPS = {
  sorvete: { key: 'carrinho-sorvete', cx: 1185, b: 330, w: 128 },
  carrossel: { key: 'carrossel', cx: 180, b: 528, w: 190 },
  escorregador: { key: 'escorregador', cx: 660, b: 338, w: 272 },
  vovo: { key: 'vovo', cx: 1158, b: 530, w: 232 },
} as const;
export const BAL = { left: 230, top: 150, w: 300, corrente: 190 };
export const GANG = { cx: 830, b: 446, w: 250, corte: 0.42 };
export const PEDRO = { x: 688, y: 600, h: 150 };
export const AREIA = { x: 760, y: 495, w: 360, h: 100, cx: 985, cy: 560 };
export const CURVA_ESC = [[0.10, 0.97], [0.13, 0.73], [0.17, 0.49], [0.34, 0.47], [0.42, 0.47], [0.55, 0.62], [0.68, 0.80], [0.82, 0.92], [0.95, 0.96]];
export const VEL_LAURA = 230, VEL_BIA = 90;

export const MOVIMENTO = { minimoX: 40, maximoX: 1240, minimoY: 300, maximoY: 705, raioArrasto: 120, pesoVertical: 1.2 };
export const PARADAS = {
  escorregador: { x: 556, y: 336 }, carrossel: { x: 180, y: 545 },
  pedro: { x: PEDRO.x - 80, y: PEDRO.y }, areia: { x: 900, y: 612 },
  vovo: { x: 1040, y: 540 }, sorvete: { x: 1110, y: 350 },
};
export const PASSEIO_BIA = { balanco: { x: 455, y: 445 }, escorregador: { x: 560, y: 352 } };

export const ANIMACOES = {
  balanco: { velocidade: 2.2, entrada: 1.5, angulo: 28 },
  gangorra: { velocidade: 2, angulo: 11, ponta: -0.36 },
  carrossel: { velocidade: 1.6, raioX: 62, raioY: 14, altura: 38, escala: 0.78 },
  escorregador: { duracao: 3.2, pausa: 0.6, descidas: 2, saidaX: 190, saidaY: 360 },
};
export const FALAS_PARQUE = {
  chegada: 'Que parque lindo!', sorvete: 'Hmm, sorvete de morango!',
  marta: 'Que menina gentil!', aceno: 'Oi, Laura!',
  biaEscorregador: 'Vou no escorregador!', biaBalanco: 'Agora o balanço!',
};
