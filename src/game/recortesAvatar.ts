/** O assento encosta na base da saia, acima das peças das pernas. */
export const ORIGEM_ASSENTO = .79;

/** Regiões dos braços e juntas em pixels dos PNGs aprovados. */
export interface RigAvatar { largura: number; altura: number; bracos: readonly (readonly number[])[]; quadris: readonly [number, number]; divisao: number; margemEsquerda?: number }
export const RIGS_AVATAR: Readonly<Record<string, RigAvatar>> = {
  'laura-liso': { largura: 222, altura: 385, bracos: [[68,214,48,264,47,278,58,284,67,274,88,222],[158,215,185,268,183,279,174,281,167,267,152,224]], quadris: [.42,.63], divisao: .53 },
  'laura-rabo': { largura: 208, altura: 406, bracos: [[80,232,58,283,56,298,66,306,78,295,95,239],[178,237,193,291,194,303,184,306,178,289,163,244]], quadris: [.47,.72], divisao: .62 },
  'laura-trancas': { largura: 178, altura: 384, bracos: [[53,211,31,259,31,276,39,280,50,269,67,220],[131,211,151,265,150,279,140,279,125,228]], quadris: [.35,.60], divisao: .48 },
  'laura-cacheado': { largura: 240, altura: 385, bracos: [[79,216,55,266,56,282,66,287,78,275,96,224],[171,216,191,267,191,281,181,283,163,229]], quadris: [.43,.62], divisao: .52 },
  'laura-coque': { largura: 164, altura: 395, bracos: [[36,228,17,278,18,295,28,300,40,283,57,235],[131,229,149,283,148,297,137,298,121,239]], quadris: [.35,.65], divisao: .50 },
  'laura-coquinhos': { margemEsquerda: 16, largura: 193, altura: 392, bracos: [[45,222,26,278,30,291,43,286,55,251,65,226],[136,223,159,279,155,289,143,281,129,230]], quadris: [.35,.62], divisao: .49 },
};

/** Seleciona pele apenas dentro da região do braço, sem capturar cabelo/roupa. */
export function peleDoBraco(r: number, g: number, b: number, alpha: number): boolean {
  return alpha>100 && r>175 && g>90 && r-g>25 && g-b>15;
}
