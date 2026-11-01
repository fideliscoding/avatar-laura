import { expect, test, type Page } from '@playwright/test';
import type Phaser from 'phaser';

declare global { interface Window { __jogo: Phaser.Game } }

async function clicar(page: Page, texto: string): Promise<void> {
  const ponto = await page.evaluate(rotulo => {
    const visitar = (lista: Phaser.GameObjects.GameObject[]): { x: number; y: number } | null => {
      for (const objeto of lista) {
        if ('visible' in objeto && !objeto.visible) continue;
        if ('text' in objeto && objeto.text === rotulo) {
          const matriz = (objeto as Phaser.GameObjects.Text).getWorldTransformMatrix();
          return { x: matriz.tx, y: matriz.ty };
        }
        if ('list' in objeto) { const achado = visitar((objeto as Phaser.GameObjects.Container).list); if (achado) return achado }
      }
      return null;
    };
    return visitar(window.__jogo.scene.getScenes(true)[0].children.list);
  }, texto);
  if (!ponto) throw new Error(`Botão ausente: ${texto}`);
  const caixa = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(caixa.x + ponto.x * caixa.width / 1280, caixa.y + ponto.y * caixa.height / 720);
}
async function temTexto(page: Page, texto: string): Promise<boolean> {
  return page.evaluate(texto => {
    const visitar = (lista: Phaser.GameObjects.GameObject[]): boolean => lista.some(objeto => {
      if ('visible' in objeto && !objeto.visible) return false;
      return ('text' in objeto && objeto.text === texto) || ('list' in objeto && visitar((objeto as Phaser.GameObjects.Container).list));
    });
    return window.__jogo.scene.getScenes(true).some(cena => visitar(cena.children.list));
  }, texto);
}

test('cadastro validado, orientação de confirmação e falha de login em pt-BR', async ({ page }) => {
  const erros: string[] = []; page.on('pageerror', e => erros.push(e.message));
  const cadastros: Record<string, unknown>[] = [];
  await page.route('https://supabase-teste.invalid/**', async rota => {
    if (rota.request().url().includes('/signup')) {
      cadastros.push(rota.request().postDataJSON() as Record<string, unknown>);
      await rota.fulfill({ status: 200, json: { user: { id: 'usuario-teste', aud: 'authenticated', role: 'authenticated', email: 'adulto@example.invalid', app_metadata: {}, user_metadata: { apelido: 'Estrela' }, created_at: '2026-11-01T00:00:00Z' } } });
    } else await rota.fulfill({ status: 400, json: { code: 'invalid_credentials', msg: 'Invalid login credentials' } });
  });
  await page.goto('./');
  await page.getByLabel('E-mail do responsável').fill('adulto@example.invalid');
  await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste-123');
  await clicar(page, 'Criar conta');
  await page.getByLabel('Apelido da criança').fill('<script>');
  await clicar(page, 'Criar conta');
  expect(cadastros).toHaveLength(0);
  await page.getByLabel('Apelido da criança').fill('Estrela');
  await clicar(page, 'Criar conta');
  await expect.poll(() => temTexto(page, 'Confira seu e-mail para confirmar a conta. Depois, volte para entrar.')).toBe(true);
  expect(cadastros).toHaveLength(1);
  expect(cadastros[0].data).toEqual({ apelido: 'Estrela' });
  await page.getByLabel('Senha', { exact: true }).fill('senha-errada-123');
  await clicar(page, 'Entrar');
  await expect.poll(() => temTexto(page, 'Não foi possível entrar. Confira os dados e a conexão e tente novamente.')).toBe(true);
  await clicar(page, 'Jogar sem conta');
  await expect.poll(() => temTexto(page, 'Crie o seu visual')).toBe(true);
  expect(erros).toEqual([]);
});

test('campos DOM acompanham o palco em celular nas duas orientações', async ({ page }) => {
  await page.goto('./'); await page.getByLabel('E-mail do responsável').waitFor();
  for (const tamanho of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(tamanho); await page.waitForTimeout(350);
    const caixa = (await page.getByLabel('E-mail do responsável').boundingBox())!;
    expect(caixa.x).toBeGreaterThanOrEqual(0);
    expect(caixa.y).toBeGreaterThanOrEqual(0);
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(tamanho.width);
    expect(caixa.y + caixa.height).toBeLessThanOrEqual(tamanho.height);
    await page.getByLabel('E-mail do responsável').fill('adulto@example.invalid');
  }
  await clicar(page, 'Jogar sem conta');
  await expect.poll(() => temTexto(page, 'Crie o seu visual')).toBe(true);
});
