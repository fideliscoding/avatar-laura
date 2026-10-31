// Lista central de assets. Chaves (key) sao usadas em todo o codigo; caminhos sao relativos a public/.
// Ancoras e escalas estao documentadas em docs/ARTE.md.

export interface Cabelo { id: string; nome: string; key: string; arquivo: string }

export const CABELOS: readonly Cabelo[] = [
  { id: 'liso', nome: 'Liso', key: 'laura-liso', arquivo: 'assets/personagens/laura/laura-frente-liso.png' },
  { id: 'rabo', nome: 'Rabo de cavalo', key: 'laura-rabo', arquivo: 'assets/personagens/laura/laura-frente-rabo.png' },
  { id: 'trancas', nome: 'Tranças', key: 'laura-trancas', arquivo: 'assets/personagens/laura/laura-frente-trancas.png' },
  { id: 'cacheado', nome: 'Cacheado', key: 'laura-cacheado', arquivo: 'assets/personagens/laura/laura-frente-cacheado.png' },
  { id: 'coque', nome: 'Coque', key: 'laura-coque', arquivo: 'assets/personagens/laura/laura-frente-coque.png' },
  { id: 'coquinhos', nome: 'Coquinhos', key: 'laura-coquinhos', arquivo: 'assets/personagens/laura/laura-frente-coquinhos.png' },
];

export const IMAGENS: Record<string, string> = {
  'parque': 'assets/cenarios/parque.jpg',
  'laura-lado-liso': 'assets/personagens/laura/laura-lado-liso.png',
  'bia': 'assets/personagens/npcs/bia.png',
  'vovo': 'assets/personagens/npcs/vovo.png',
  'pedro-triste': 'assets/personagens/npcs/pedro-triste.png',
  'pedro-feliz': 'assets/personagens/npcs/pedro-feliz.png',
  'balanco-estrutura': 'assets/objetos/balanco-estrutura.png',
  'balanco-assento': 'assets/objetos/balanco-assento.png',
  'escorregador': 'assets/objetos/escorregador.png',
  'gangorra': 'assets/objetos/gangorra.png',
  'carrossel': 'assets/objetos/carrossel.png',
  'carrinho-sorvete': 'assets/objetos/carrinho-sorvete.png',
  'carrinho-azul': 'assets/objetos/carrinho-azul.png',
};

export const FONTE = 'Fredoka, "Arial Rounded MT Bold", sans-serif';

export const CORES = {
  fundo: 0x2b1f45,
  lilas: 0xb58cf5,
  roxo: 0x8b55e6,
  roxoEscuro: 0x5b2bb5,
  textoRoxo: '#5a2fa8',
  textoEscuro: '#3d2470',
  rosa: 0xf27ab3,
  rosaEscuro: 0xc24f8a,
  branco: 0xffffff,
  confete: [0xff6fb5, 0xffd23f, 0x7bdff2, 0xa274f5, 0x7be08a, 0xff9f5a, 0xffffff],
} as const;
