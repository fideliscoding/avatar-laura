import { describe, expect, it } from 'vitest';
import { CABELOS } from '../src/config/assets';
import { peleDoBraco, RIGS_AVATAR, ORIGEM_ASSENTO } from '../src/game/recortesAvatar';
import { movimentoAvatar } from '../src/game/movimentoAvatar';

describe('silhueta dos avatares', () => {
  it('possui juntas próprias para cada cabelo aprovado', () => {
    expect(ORIGEM_ASSENTO).toBeLessThan(.81);
    expect(Object.keys(RIGS_AVATAR).sort()).toEqual(CABELOS.map(c=>c.key).sort());
    for (const rig of Object.values(RIGS_AVATAR)) {
      expect(rig.quadris[0]).toBeLessThan(rig.divisao);
      expect(rig.quadris[1]).toBeGreaterThan(rig.divisao);
    }
  });
  it('reconhece amostras reais da pele dos seis PNGs e rejeita cabelo, roupa e transparência', () => {
    for (const [r,g,b] of [[237,164,109],[243,161,111],[241,161,110],[237,166,120],[240,162,113],[240,165,110]]) expect(peleDoBraco(r,g,b,255)).toBe(true);
    for (const [r,g,b,a] of [[80,45,31,255],[181,140,245,255],[224,202,251,0],[237,164,109,0]]) expect(peleDoBraco(r,g,b,a)).toBe(false);
  });
  it('mantém as pernas frontais simétricas e o aceno para fora do corpo', () => {
    for (let t=0;t<6;t+=.1) {
      const pose=movimentoAvatar('sentar',t);
      expect(pose.pernaE).toBeCloseTo(-pose.pernaD);
      expect(Math.abs(pose.pernaE)).toBeLessThanOrEqual(17);
      expect(movimentoAvatar('acenar',t).bracoE).toBeGreaterThanOrEqual(90);
    }
    expect(movimentoAvatar('acenar',0,'recortes').bracoE).toBe(-25);
  });
});
