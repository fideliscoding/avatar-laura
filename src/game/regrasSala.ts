export const LIMITE_SALA = 6;
export function normalizarCodigo(codigo: string): string | null {
  const normalizado = codigo.trim().toUpperCase();
  return /^[A-Z]{6}$/.test(normalizado) ? normalizado : null;
}
export function podeAprovar(dono: boolean, aprovados: number, jaAprovado = false): boolean {
  return dono && (jaAprovado || aprovados < LIMITE_SALA);
}

export interface UltimoEnvio { instante: number; assinatura: string }
export function deveEnviar(ultimo: UltimoEnvio | null, agora: number, assinatura: string): boolean {
  return !ultimo || (agora - ultimo.instante >= 100 && assinatura !== ultimo.assinatura);
}
export function interpolar(atual: number, alvo: number, delta: number): number {
  return atual + (alvo - atual) * (1 - Math.exp(-12 * Math.max(0, Math.min(0.25, delta))));
}

export const ESTADOS_AVATAR = ['parada', 'andar', 'arrastando', 'balanco', 'escorregador', 'gangorra', 'carrossel', 'danca'] as const;
export type EstadoAvatar = typeof ESTADOS_AVATAR[number];
export const ACENOS = ['aceno','pulo','coracao'] as const;
export type Aceno = typeof ACENOS[number];
export function acenoValido(valor: unknown): valor is Aceno { return ACENOS.some(aceno => aceno === valor) }
export interface EstadoCompartilhado { x: number; y: number; cabelo: string; estado: EstadoAvatar; angulo: number; origemY: number; sx: number; sy: number; z: number }
const CABELOS = ['liso','rabo','trancas','cacheado','coque','coquinhos'];

/** Ignora identidade e texto do payload; a identidade vem do tópico autorizado. */
export function validarEstadoRemoto(valor: unknown): EstadoCompartilhado | null {
  if (!valor || typeof valor !== 'object') return null;
  const v = valor as Record<string, unknown>;
  const numero = (nome: string, min: number, max: number) => typeof v[nome] === 'number' && Number.isFinite(v[nome]) && Number(v[nome]) >= min && Number(v[nome]) <= max;
  if (!numero('x',0,1280) || !numero('y',0,720) || (typeof v.cabelo !== 'string' || !CABELOS.includes(v.cabelo)) || !ESTADOS_AVATAR.includes(v.estado as EstadoAvatar)) return null;
  if (!numero('angulo',-180,180) || !numero('origemY',0.4,1) || !numero('sx',-1.3,1.3) || !numero('sy',0.5,1.3) || !numero('z',0,800)) return null;
  return { x: Number(v.x), y: Number(v.y), cabelo: String(v.cabelo), estado: v.estado as EstadoAvatar, angulo: Number(v.angulo), origemY: Number(v.origemY), sx: Number(v.sx), sy: Number(v.sy), z: Number(v.z) };
}
