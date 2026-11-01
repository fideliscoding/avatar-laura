import { expect, type Page } from '@playwright/test';
import type Phaser from 'phaser';
declare global { interface Window { __jogo: Phaser.Game } }

export async function tocarTela(page: Page, x: number, y: number): Promise<void> {
  const tamanho = await page.evaluate(() => ({ w: window.__jogo.scale.width, h: window.__jogo.scale.height, toque: navigator.maxTouchPoints > 0 }));
  const caixa = (await page.locator('canvas').boundingBox())!;
  const px = caixa.x + x * caixa.width / tamanho.w, py = caixa.y + y * caixa.height / tamanho.h;
  if (tamanho.toque) await page.touchscreen.tap(px, py);
  else await page.mouse.click(px, py);
  await page.waitForTimeout(80);
}
export async function projetar(page: Page, x: number, y: number): Promise<{ x: number; y: number }> {
  return page.evaluate(({ x, y }) => {
    const camera = window.__jogo.scene.getScene('Parque').cameras.main;
    return { x: camera.x + (x - camera.worldView.x) * camera.zoom, y: camera.y + (y - camera.worldView.y) * camera.zoom };
  }, { x, y });
}
export async function tocar(page: Page, x: number, y: number): Promise<void> {
  const ponto = await projetar(page, x, y); await tocarTela(page, ponto.x, ponto.y);
}
export async function textos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const resultado: string[] = [];
    const visitar = (objetos: Phaser.GameObjects.GameObject[]): void => {
      for (const objeto of objetos) {
        if ('visible' in objeto && !objeto.visible) continue;
        if ('text' in objeto) resultado.push(String(objeto.text));
        if ('list' in objeto) visitar((objeto as Phaser.GameObjects.Container).list);
      }
    };
    for (const cena of window.__jogo.scene.getScenes(true)) visitar(cena.children.list);
    return resultado;
  });
}
export async function botao(page: Page, texto: string): Promise<void> {
  // Aguarda a apresentação do novo viewport antes de tocar após rotação/teclado.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect.poll(() => textos(page)).toContain(texto);
  const ponto = await page.evaluate(rotulo => {
    const buscar = (objetos: Phaser.GameObjects.GameObject[]): { x: number; y: number } | null => {
      for (const objeto of objetos) {
        if ('visible' in objeto && !objeto.visible) continue;
        if ('text' in objeto && objeto.text === rotulo) {
          const matriz = (objeto as Phaser.GameObjects.Text).getWorldTransformMatrix();
          return { x: matriz.tx, y: matriz.ty };
        }
        if ('list' in objeto) { const achado = buscar((objeto as Phaser.GameObjects.Container).list); if (achado) return achado }
      }
      return null;
    };
    for (const cena of window.__jogo.scene.getScenes(true)) { const achado = buscar(cena.children.list); if (achado) return achado }
    return null;
  }, texto);
  if (!ponto) throw new Error(`Botão ausente: ${texto}`);
  await tocarTela(page, ponto.x, ponto.y);
}
export async function destino(page: Page, nome: string): Promise<void> {
  for (let pagina = 0; pagina < 8; pagina++) {
    if ((await textos(page)).includes(nome)) { await botao(page, nome); return }
    await botao(page, '>');
  }
  throw new Error(`Destino ausente: ${nome}`);
}
