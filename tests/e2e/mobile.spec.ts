import { expect, test } from '@playwright/test';
import type Phaser from 'phaser';
import { botao, destino, textos, tocar } from '../apoio/jogo';
import { TEXTOS } from '../../src/game/missaoPedrinho';

interface ParqueObservado {
  L: { x: number; y: number; andando: boolean; estado: string; img: Phaser.GameObjects.Image };
  animadores: { laura: { partes: Phaser.GameObjects.Image[] }; bia: { partes: Phaser.GameObjects.Image[] }; marta: { partes: Phaser.GameObjects.Image[] } };
}

test.describe('jogo mobile first', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('missão por toque, câmera, membros articulados e rotação com diálogo aberto', async ({ page }) => {
    const erros: string[] = []; page.on('pageerror', erro => erros.push(erro.message));
    await page.goto('./'); await expect.poll(() => textos(page)).toContain('Crie o seu visual');
    const caixa = (await page.locator('canvas').boundingBox())!;
    expect(caixa.height).toBe(844); expect(caixa.width).toBe(390);
    await botao(page, 'Cacheado'); await botao(page, 'Ir para o parque');
    await expect.poll(() => textos(page)).toContain('Balanço');
    await tocar(page, 550, 650);
    await expect.poll(() => page.evaluate(() => Math.abs((window.__jogo.scene.getScene('Parque') as unknown as ParqueObservado).L.x - 550))).toBeLessThan(10);
    await destino(page, 'Sorvete');
    await expect.poll(() => page.evaluate(() => (window.__jogo.scene.getScene('Parque') as unknown as ParqueObservado).L.andando)).toBe(true);
    const passos = async () => page.evaluate(() => (window.__jogo.scene.getScene('Parque') as unknown as ParqueObservado).animadores.laura.partes.map(parte => parte.angle));
    const antes = await passos(); await page.waitForTimeout(220); expect(await passos()).not.toEqual(antes);
    expect(await page.evaluate(() => {
      const cena = window.__jogo.scene.getScene('Parque');
      const laura = (cena as unknown as ParqueObservado).L.img;
      return laura.displayHeight * cena.cameras.main.zoom;
    })).toBeGreaterThan(110);
    await expect.poll(() => textos(page)).toContain('Hmm, sorvete de morango!');
    expect(await page.evaluate(() => window.__jogo.scene.getScene('Parque').cameras.main.scrollX)).toBeGreaterThan(500);
    await destino(page, 'Pedrinho'); await botao(page, TEXTOS.respostaAjudar);
    await destino(page, 'Areia'); await expect.poll(() => textos(page)).toContain(TEXTOS.pergunta);
    await page.screenshot({ path: 'docs/screenshots/mobile/4-escolhas-retrato.png' });
    await botao(page, TEXTOS.opcoes.A); await expect.poll(() => textos(page)).toContain(TEXTOS.conselhoA);
    await botao(page, TEXTOS.tentarDeNovo);
    await page.setViewportSize({ width: 567, height: 298 }); await page.waitForTimeout(300);
    await expect.poll(() => textos(page)).toContain(TEXTOS.pergunta);
    const botoes = await page.evaluate(() => {
      const cena = window.__jogo.scene.getScene('Interface'); const encontrados: { x: number; y: number; width: number; height: number }[] = [];
      const visitar = (lista: Phaser.GameObjects.GameObject[]): void => {
        for (const objeto of lista) if ('list' in objeto) {
          const c = objeto as Phaser.GameObjects.Container;
          if (c.visible && c.list.some(filho => 'text' in filho && /^[ABC]\)/.test(String(filho.text)))) { const area = c.input!.hitArea as Phaser.Geom.Rectangle; encontrados.push({ x: c.getWorldTransformMatrix().tx - area.width / 2, y: c.getWorldTransformMatrix().ty - area.height / 2, width: area.width, height: area.height }) }
          visitar(c.list);
        }
      };
      visitar(cena.children.list); return encontrados;
    });
    expect(botoes).toHaveLength(3);
    for (const b of botoes) {
      expect(b.height).toBeGreaterThanOrEqual(44); expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y + b.height).toBeLessThanOrEqual(298);
      expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x + b.width).toBeLessThanOrEqual(567);
    }
    for (let i = 0; i < botoes.length; i++) for (let j = i + 1; j < botoes.length; j++) {
      const a = botoes[i], b = botoes[j];
      expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
    }
    await page.screenshot({ path: 'docs/screenshots/mobile/6-missao-paisagem-pequena.png' });
    await botao(page, TEXTOS.opcoes.B);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mtmw:progresso:v1')!).moedas)).toBe(15);
    await botao(page, 'De nada!');
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);
    await destino(page, 'Balanço');
    await expect.poll(() => page.evaluate(() => (window.__jogo.scene.getScene('Parque') as unknown as ParqueObservado).L.estado)).toBe('balanco');
    await page.screenshot({ path: 'docs/screenshots/mobile/7-balanco-retrato.png' });
    expect(erros).toEqual([]);
  });

  test('criador ocupa a tela de um aparelho pequeno e preserva o cabelo ao girar', async ({ page }) => {
    await page.setViewportSize({ width: 298, height: 567 }); await page.goto('./');
    await expect.poll(() => textos(page)).toContain('Crie o seu visual');
    await botao(page, 'Coquinhos');
    await page.screenshot({ path: 'docs/screenshots/mobile/8-criador-pequeno.png' });
    await page.setViewportSize({ width: 567, height: 298 }); await page.waitForTimeout(300);
    await botao(page, 'Ir para o parque'); await expect.poll(() => textos(page)).toContain('Trocar cabelo');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mtmw:progresso:v1')!).cabelo)).toBe(5);
  });
});
