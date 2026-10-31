import { describe, expect, it } from 'vitest';
import { carregar, salvar, recompensarMissao, type Armazenamento } from '../src/game/estado';

function memoria(): Armazenamento & { d: Record<string, string> } {
  const d: Record<string, string> = {};
  return { d, getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = v } };
}

describe('progresso local', () => {
  it('padrao quando vazio', () => { expect(carregar(memoria())).toEqual({ cabelo: 0, moedas: 0, missoesConcluidas: [] }) });
  it('salva e carrega', () => {
    const m = memoria(); salvar({ cabelo: 3, moedas: 15, missoesConcluidas: ['pedrinho-carrinho'] }, m);
    expect(carregar(m)).toEqual({ cabelo: 3, moedas: 15, missoesConcluidas: ['pedrinho-carrinho'] });
  });
  it('ignora dados corrompidos ou invalidos', () => {
    const m = memoria(); m.d['mtmw:progresso:v1'] = '{"cabelo":99,"moedas":-5}';
    expect(carregar(m)).toEqual({ cabelo: 0, moedas: 0, missoesConcluidas: [] });
    m.d['mtmw:progresso:v1'] = 'nao-e-json'; expect(carregar(m).moedas).toBe(0);
  });
  it('funciona sem armazenamento', () => { expect(carregar(null).cabelo).toBe(0) });
});

describe('recompensa por missão', () => {
  it('paga uma vez e preserva o registro após recarregar', () => {
    const p = carregar(null), arm = memoria();
    const recompensa = recompensarMissao(p, 'pedrinho-carrinho', 15);
    expect(recompensa.moedas).toBe(15);
    expect(p.moedas).toBe(0);
    expect(p.missoesConcluidas).toEqual([]);
    salvar(recompensa.progresso, arm);
    const salvo = carregar(arm);
    expect(recompensarMissao(salvo, 'pedrinho-carrinho', 15).moedas).toBe(0);
    expect(salvo.moedas).toBe(15);
  });
  it('não registra escolhas sem recompensa', () => {
    const p = carregar(null);
    expect(recompensarMissao(p, 'pedrinho-carrinho', 0).moedas).toBe(0);
    expect(p.missoesConcluidas).toEqual([]);
  });
});
