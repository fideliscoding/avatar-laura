import { describe, expect, it } from 'vitest';
import { carregar, salvar, type Armazenamento } from '../src/game/estado';

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
