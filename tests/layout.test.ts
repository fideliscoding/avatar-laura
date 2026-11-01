import { describe, expect, it } from 'vitest';
import { layoutEntrada, layoutParque } from '../src/game/layout';
import { movimentoAvatar } from '../src/game/movimentoAvatar';

describe('layout mobile first', () => {
  for (const [w, h] of [[298,567],[390,844],[567,298],[844,390],[1280,720]]) {
    it(`mantém controles e área jogável em ${w}x${h}`, () => {
      const l = layoutParque(w,h,true);
      expect(l.zoom * 172).toBeGreaterThanOrEqual(110);
      expect(l.alturaMundo).toBeGreaterThanOrEqual(100);
      expect(l.cabecalho + l.alturaMundo + l.rodape).toBeLessThanOrEqual(h);
      expect(l.porPagina).toBeGreaterThanOrEqual(1);
      const entrada = layoutEntrada(w,h);
      expect(entrada.larguraForm).toBeLessThan(w);
      expect(entrada.topoForm + entrada.alturaForm).toBeLessThan(entrada.acaoY);
      expect(entrada.offlineY + 24).toBeLessThanOrEqual(h);
    });
  }
});
describe('articulação de avatares', () => {
  it('alterna pernas e braços em oposição durante os passos', () => {
    const passo = movimentoAvatar('andar', Math.PI/20);
    expect(passo.pernaE).toBeGreaterThan(0);
    expect(passo.pernaD).toBeLessThan(0);
    expect(passo.bracoE).toBeLessThan(0);
    expect(passo).not.toEqual(movimentoAvatar('andar', 0));
  });
  it('distingue pernas sentadas, aceno, comemoração e respiração', () => {
    expect(movimentoAvatar('sentar',0).pernaE).toBeLessThan(-40);
    expect(movimentoAvatar('escorregar',0).pernaD).toBeLessThan(-40);
    expect(movimentoAvatar('acenar',0.2).bracoE).not.toBe(movimentoAvatar('parada',0.2).bracoE);
    expect(movimentoAvatar('dancar',0.5).pernaE).not.toBe(0);
    expect(movimentoAvatar('parada',0.5).cabeca).not.toBe(0);
  });
});
