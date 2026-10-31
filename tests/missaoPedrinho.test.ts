import { describe, expect, it } from 'vitest';
import { aceitarAjuda, cavarAreia, escolher, novaMissao, RECOMPENSA_MOEDAS, TEXTOS } from '../src/game/missaoPedrinho';

describe('missao do Pedrinho', () => {
  it('fluxo completo: aceitar, cavar, devolver (B) da 15 moedas', () => {
    let s = aceitarAjuda(novaMissao());
    expect(s.etapa).toBe('procurando');
    const c = cavarAreia(s); expect(c.achou).toBe(true); s = c.estado;
    expect(s.etapa).toBe('escolhendo');
    const r = escolher(s, 'B');
    expect(r.estado.etapa).toBe('concluida');
    expect(r.moedas).toBe(15);
    expect(RECOMPENSA_MOEDAS).toBe(15);
  });

  it('A e C nao dao moedas, mostram conselho gentil e permitem tentar de novo', () => {
    const s = cavarAreia(aceitarAjuda(novaMissao())).estado;
    const a = escolher(s, 'A');
    expect(a.moedas).toBe(0); expect(a.conselho).toBe(TEXTOS.conselhoA); expect(a.estado.etapa).toBe('escolhendo');
    const c = escolher(a.estado, 'C');
    expect(c.moedas).toBe(0); expect(c.conselho).toBe(TEXTOS.conselhoC); expect(c.estado.tentativasErradas).toBe(2);
    expect(escolher(c.estado, 'B').moedas).toBe(15);
  });

  it('nao paga duas vezes nem acha o carrinho depois de concluida', () => {
    const fim = escolher(cavarAreia(aceitarAjuda(novaMissao())).estado, 'B').estado;
    expect(escolher(fim, 'B').moedas).toBe(0);
    expect(cavarAreia(fim).achou).toBe(false);
  });

  it('textos nao tem emojis', () => {
    const tudo = JSON.stringify(TEXTOS);
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(tudo)).toBe(false);
  });
});
