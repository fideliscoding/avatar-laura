import { expect, test, type Page } from '@playwright/test';
import type Phaser from 'phaser';
import { TEXTOS } from '../../src/game/missaoPedrinho';

import { botao, tocar, projetar, textos } from '../apoio/jogo';

async function abrir(page: Page): Promise<void> {
  await page.goto('./');
  await expect.poll(() => textos(page)).toContain('Crie o seu visual');
}

async function buscarCarrinho(page: Page): Promise<void> {
  await tocar(page, 688, 510);
  await botao(page, TEXTOS.respostaAjudar);
  await expect.poll(() => textos(page)).toContain(TEXTOS.objetivoProcurar);
  await tocar(page, 985, 560);
  await expect.poll(() => textos(page)).toContain(TEXTOS.pergunta);
}

test('missão completa, conselhos, persistência e recompensa única ao repetir', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', erro => erros.push(erro.message));
  page.on('console', mensagem => { if (mensagem.type() === 'error') erros.push(mensagem.text()) });
  await abrir(page);
  for (const cabelo of ['Liso', 'Rabo de cavalo', 'Tranças', 'Cacheado', 'Coque', 'Coquinhos']) expect(await textos(page)).toContain(cabelo);
  await botao(page, 'Cacheado');
  await page.reload();
  await expect.poll(() => textos(page)).toContain('Crie o seu visual');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mtmw:progresso:v1')!).cabelo)).toBe(3);
  await page.screenshot({ path: 'docs/screenshots/phaser/1-criador.png' });
  await botao(page, 'Ir para o parque');
  await buscarCarrinho(page);
  await page.screenshot({ path: 'docs/screenshots/phaser/2-escolha.png' });
  for (const opcao of ['A', 'C'] as const) {
    await botao(page, TEXTOS.opcoes[opcao]);
    await expect.poll(() => textos(page)).toContain(opcao === 'A' ? TEXTOS.conselhoA : TEXTOS.conselhoC);
    if (opcao === 'A') await page.screenshot({ path: 'docs/screenshots/phaser/3-conselho.png' });
    await botao(page, TEXTOS.tentarDeNovo);
  }
  await botao(page, TEXTOS.opcoes.B);
  await expect.poll(() => textos(page)).toContain(TEXTOS.objetivoConcluida);
  await page.screenshot({ path: 'docs/screenshots/phaser/4-confete.png' });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mtmw:progresso:v1')!).moedas)).toBe(15);
  await botao(page, 'Jogar a missão de novo');
  await buscarCarrinho(page);
  await botao(page, TEXTOS.opcoes.B);
  await botao(page, 'De nada!');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mtmw:progresso:v1')!).moedas)).toBe(15);
  await botao(page, 'Trocar cabelo');
  await botao(page, 'Liso');
  await botao(page, 'Ir para o parque');
  await tocar(page, 688, 510);
  await botao(page, 'Vamos!');
  expect(erros).toEqual([]);
});

test('palco cabe no celular nas duas orientações', async ({ page }) => {
  await abrir(page);
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(400);
    const caixa = await page.locator('canvas').boundingBox();
    expect(caixa).not.toBeNull();
    expect(caixa!.width).toBeLessThanOrEqual(viewport.width);
    expect(caixa!.height).toBeLessThanOrEqual(viewport.height);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await botao(page, 'Cacheado');
    await botao(page, 'Ir para o parque');
    await botao(page, 'Trocar cabelo');
  }
});

interface EstadoObservado {
  L: { x: number; y: number; estado: string; andando: boolean; slideT: number; img: Phaser.GameObjects.Image };
  bia: { x: number; y: number };
}

async function estadoLaura(page: Page): Promise<string> {
  return page.evaluate(() => (window.__jogo.scene.getScene('Parque') as unknown as EstadoObservado).L.estado);
}

test('chão, arrasto, brinquedos e falas do parque', async ({ page }) => {
  await abrir(page);
  await botao(page, 'Ir para o parque');
  await tocar(page, 500, 680);
  await expect.poll(() => page.evaluate(() => Math.abs((window.__jogo.scene.getScene('Parque') as unknown as EstadoObservado).L.x - 500))).toBeLessThan(4);
  const inicio = await projetar(page, 500, 600);
  await page.mouse.move(inicio.x, inicio.y); await page.mouse.down();
  for (let i = 0; i < 3; i++) {
    const fim = await projetar(page, 372, 338);
    await page.mouse.move(fim.x, fim.y, { steps: 10 }); await page.waitForTimeout(80);
  }
  await page.mouse.up();
  await expect.poll(() => estadoLaura(page)).toBe('balanco');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'docs/screenshots/phaser/5-balanco.png' });
  await tocar(page, 850, 390);
  await expect.poll(() => estadoLaura(page)).toBe('gangorra');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/screenshots/phaser/6-gangorra.png' });
  await tocar(page, 180, 420);
  await expect.poll(() => estadoLaura(page)).toBe('carrossel');
  await page.screenshot({ path: 'docs/screenshots/phaser/7-carrossel.png' });
  await tocar(page, 650, 220);
  await expect.poll(() => estadoLaura(page)).toBe('escorregador');
  await page.screenshot({ path: 'docs/screenshots/phaser/8-escorregador.png' });
  await expect.poll(() => estadoLaura(page)).toBe('parada');
  expect(await page.evaluate(() => (window.__jogo.scene.getScene('Parque') as unknown as EstadoObservado).L.slideT)).toBeGreaterThan(7.6);
  await tocar(page, 1185, 260);
  await expect.poll(() => textos(page)).toContain('Hmm, sorvete de morango!');
  await tocar(page, 1170, 420);
  await expect.poll(() => textos(page)).toContain('Que menina gentil!');
});
