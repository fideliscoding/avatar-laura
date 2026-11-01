import { expect, test, type Page } from '@playwright/test';

import { botao as clicar, textos } from '../apoio/jogo';
async function temTexto(page: Page, texto: string): Promise<boolean> { return (await textos(page)).includes(texto) }

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

test('formulário continua utilizável quando a área visível diminui com o teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('./');
  await page.getByLabel('E-mail do responsável').fill('adulto@example.invalid');
  await clicar(page, 'Criar conta');
  await page.getByLabel('Apelido da criança').fill('Estrela');
  await page.setViewportSize({ width: 390, height: 320 });
  await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste-123');
  await page.getByLabel('Apelido da criança').fill('Estrela Nova');
  await expect.poll(async () => {
    const campo = (await page.getByLabel('Apelido da criança').boundingBox())!;
    const form = (await page.locator('form').boundingBox())!;
    return campo.y >= form.y && campo.y + campo.height <= form.y + form.height;
  }).toBe(true);
  const entrada = (await page.getByLabel('Apelido da criança').boundingBox())!;
  expect(entrada.y).toBeGreaterThanOrEqual(0); expect(entrada.y + entrada.height).toBeLessThanOrEqual(320);
  expect(await page.getByLabel('E-mail do responsável').inputValue()).toBe('adulto@example.invalid');
  await page.getByLabel('Apelido da criança').fill('@');
  await clicar(page, 'Criar conta');
  await expect.poll(() => temTexto(page, 'Escolha um apelido gentil de 1 a 20 letras, números ou espaços.')).toBe(true);
  const limites = await page.evaluate(() => {
    const cena = window.__jogo.scene.getScene('Entrar') as unknown as { aviso: { getBounds(): { top: number; bottom: number } }; acao: { y: number; height: number } };
    const aviso = cena.aviso.getBounds();
    return { avisoTopo: aviso.top, avisoFim: aviso.bottom, botaoTopo: cena.acao.y - cena.acao.height / 2 };
  });
  const formulario = (await page.locator('form').boundingBox())!;
  expect(formulario.y + formulario.height).toBeLessThanOrEqual(limites.avisoTopo);
  expect(limites.avisoFim).toBeLessThanOrEqual(limites.botaoTopo);
  await page.screenshot({ path: 'docs/screenshots/mobile/9-conta-area-teclado.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await clicar(page, 'Jogar sem conta');
  await expect.poll(() => temTexto(page, 'Crie o seu visual')).toBe(true);
});

test('conta no parque pequeno mantém apelido, saldo e sair sem sobrepor controles', async ({ page }) => {
  await page.setViewportSize({ width: 298, height: 567 });
  const usuario = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'adulto@example.invalid', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-11-01T00:00:00Z' };
  const codificar = (valor: unknown) => btoa(JSON.stringify(valor)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  const token = `${codificar({ alg: 'HS256', typ: 'JWT' })}.${codificar({ sub: usuario.id, exp: Math.floor(Date.now()/1000)+3600, role: 'authenticated' })}.assinatura-de-teste`;
  await page.route('https://supabase-teste.invalid/**', async rota => {
    const url = rota.request().url();
    if (url.includes('/token')) await rota.fulfill({ json: { access_token: token, token_type: 'bearer', expires_in: 3600, refresh_token: 'refresh-de-teste', user: usuario } });
    else if (url.includes('/profiles')) await rota.fulfill({ json: { moedas: 15, apelido: 'Estrela Lilas 123' } });
    else if (url.includes('/avatars')) await rota.fulfill({ json: { cabelo: 'cacheado' } });
    else if (url.includes('/progress')) await rota.fulfill({ json: [{ mission_id: 'pedrinho-carrinho', status: 'concluida' }] });
    else if (url.includes('/logout')) await rota.fulfill({ status: 204 });
    else await rota.fulfill({ json: usuario });
  });
  await page.goto('./');
  await page.getByLabel('E-mail do responsável').fill('adulto@example.invalid');
  await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste-123');
  await clicar(page, 'Entrar'); await expect.poll(() => temTexto(page, 'Crie o seu visual')).toBe(true);
  await clicar(page, 'Ir para o parque'); await expect.poll(() => temTexto(page, 'Estrela Lilas 123')).toBe(true);
  await expect.poll(() => temTexto(page, '15')).toBe(true);
  await page.screenshot({ path: 'docs/screenshots/mobile/10-conta-parque-pequeno.png' });
  await clicar(page, 'Sair'); await page.getByLabel('E-mail do responsável').waitFor();
});
