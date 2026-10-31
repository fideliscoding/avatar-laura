// Estado do jogador salvo no navegador (localStorage). Na etapa 03 isso passa a sincronizar com o Supabase.
export interface Progresso { cabelo: number; moedas: number; missoesConcluidas: string[] }

const CHAVE = 'mtmw:progresso:v1';
const PADRAO: Progresso = { cabelo: 0, moedas: 0, missoesConcluidas: [] };

export interface Armazenamento { getItem(k: string): string | null; setItem(k: string, v: string): void }

function armazenamentoPadrao(): Armazenamento | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null } catch { return null }
}

export function carregar(arm: Armazenamento | null = armazenamentoPadrao()): Progresso {
  if (!arm) return { ...PADRAO, missoesConcluidas: [] };
  try {
    const p = JSON.parse(arm.getItem(CHAVE) ?? 'null') as Partial<Progresso> | null;
    if (!p) return { ...PADRAO, missoesConcluidas: [] };
    return {
      cabelo: Number.isInteger(p.cabelo) && p.cabelo! >= 0 && p.cabelo! < 6 ? p.cabelo! : 0,
      moedas: Number.isFinite(p.moedas) && p.moedas! >= 0 ? Math.floor(p.moedas!) : 0,
      missoesConcluidas: Array.isArray(p.missoesConcluidas) ? p.missoesConcluidas.filter((x) => typeof x === 'string') : [],
    };
  } catch { return { ...PADRAO, missoesConcluidas: [] } }
}

export function salvar(p: Progresso, arm: Armazenamento | null = armazenamentoPadrao()): void {
  try { arm?.setItem(CHAVE, JSON.stringify(p)) } catch { /* modo privado: ignora */ }
}

/** Estado compartilhado entre cenas durante a sessao. */
export const progresso: Progresso = carregar();
export function persistir(): void { salvar(progresso) }
