// Cache local do jogador, separado entre convidado e contas; a camada net sincroniza contas com o servidor.
export interface Progresso { cabelo: number; moedas: number; missoesConcluidas: string[] }

const CHAVE = 'mtmw:progresso:v1';
let chaveAtual = CHAVE;
const PADRAO: Progresso = { cabelo: 0, moedas: 0, missoesConcluidas: [] };

export interface Armazenamento { getItem(k: string): string | null; setItem(k: string, v: string): void }

function armazenamentoPadrao(): Armazenamento | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null } catch { return null }
}

export function carregar(arm: Armazenamento | null = armazenamentoPadrao(), chave = CHAVE): Progresso {
  if (!arm) return { ...PADRAO, missoesConcluidas: [] };
  try {
    const p = JSON.parse(arm.getItem(chave) ?? 'null') as Partial<Progresso> | null;
    if (!p) return { ...PADRAO, missoesConcluidas: [] };
    return {
      cabelo: Number.isInteger(p.cabelo) && p.cabelo! >= 0 && p.cabelo! < 6 ? p.cabelo! : 0,
      moedas: Number.isFinite(p.moedas) && p.moedas! >= 0 ? Math.floor(p.moedas!) : 0,
      missoesConcluidas: Array.isArray(p.missoesConcluidas) ? p.missoesConcluidas.filter((x) => typeof x === 'string') : [],
    };
  } catch { return { ...PADRAO, missoesConcluidas: [] } }
}

export function salvar(p: Progresso, arm: Armazenamento | null = armazenamentoPadrao(), chave = CHAVE): void {
  try { arm?.setItem(chave, JSON.stringify(p)) } catch { /* modo privado: ignora */ }
}

/** Estado compartilhado entre cenas durante a sessao. */
export const progresso: Progresso = carregar();
export function persistir(): void { salvar(progresso, armazenamentoPadrao(), chaveAtual) }

/** Separa o convidado e cada conta neste dispositivo, sem compartilhar saldo nem missões. */
export function usarProgresso(p: Progresso, usuario: string | null): void {
  chaveAtual = usuario ? `mtmw:conta:v1:${usuario}` : CHAVE;
  Object.assign(progresso, p);
  persistir();
}

/** Registra a recompensa de uma missão uma única vez, inclusive ao repetir a história. */
export function recompensarMissao(p: Progresso, id: string, moedas: number): { progresso: Progresso; moedas: number } {
  if (p.missoesConcluidas.includes(id) || moedas <= 0) return { progresso: p, moedas: 0 };
  return {
    progresso: { ...p, moedas: p.moedas + moedas, missoesConcluidas: [...p.missoesConcluidas, id] },
    moedas,
  };
}
