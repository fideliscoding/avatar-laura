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
export async function projetar(page: Page, x: number, y: number, cena='Parque'): Promise<{ x: number; y: number }> {
  return page.evaluate(({ x, y, cena }) => {
    const camera = window.__jogo.scene.getScene(cena).cameras.main;
    return { x: camera.x + (x - camera.worldView.x) * camera.zoom, y: camera.y + (y - camera.worldView.y) * camera.zoom };
  }, { x, y, cena });
}
export async function tocar(page: Page, x: number, y: number, cena='Parque'): Promise<void> {
  const ponto = await projetar(page, x, y, cena); await tocarTela(page, ponto.x, ponto.y);
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
  await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
  const nativo=page.getByRole('button',{name:texto,exact:true});if(await nativo.count()===1&&await nativo.isVisible()){await nativo.click();await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));return}
  const rotas=new Set(['Trocar cabelo','Mochila','Levantar','Mapa da cidade','Cidade','Parque','Padaria','Pet Shop','Casa','Cômodos','Balanço','Escorregador','Gangorra','Carrossel','Sorvete','Dona Marta','Pedrinho','Areia','Esperar a vez','Meu diário','Sentar no banco','Pegar sorvete','Bebedouro','Amigos','Sair','Cuidar do Bolinha','Troco a mais']);
  if((rotas.has(texto)||texto.startsWith('Usar '))&&!(await textos(page)).includes(texto)&&await page.getByRole('button',{name:'Celular',exact:true}).count()){
    const celular=page.getByRole('dialog',{name:'Celular',exact:true});
    while(await celular.isVisible())await celular.getByRole('button',{name:'Voltar',exact:true}).click();
    await page.getByRole('button',{name:'Celular',exact:true}).click();
    if(texto==='Amigos'||texto==='Sair'){await celular.getByRole('button',{name:texto,exact:true}).click();return}
    const app=/Trocar cabelo|Mochila|Levantar|^Usar /.test(texto)?'Personagens':texto==='Meu diário'?'Moedas':'Mapa';
    await celular.getByRole('button',{name:app,exact:true}).click();await celular.getByRole('button',{name:texto,exact:true}).click();const destinoCena:Record<string,string>={'Mapa da cidade':'Cidade',Cidade:'Cidade',Parque:'Parque',Casa:'Casa',Padaria:'Padaria','Pet Shop':'PetShop'};if(destinoCena[texto])await expect.poll(()=>page.evaluate(k=>window.__jogo.scene.isActive(k),destinoCena[texto])).toBe(true);await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));return;
  }
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
    for (const cena of window.__jogo.scene.getScenes(true).slice().reverse()) { const achado = buscar(cena.children.list); if (achado) return achado }
    return null;
  }, texto);
  if (!ponto) throw new Error(`Botão ausente: ${texto}`);
  await tocarTela(page, ponto.x, ponto.y);
}
export async function destino(page: Page, nome: string): Promise<void> {
  await botao(page,nome);
}

export async function saldoVisivel(page:Page,valor:number):Promise<void>{
 await page.getByRole('button',{name:'Celular',exact:true}).click();const c=page.getByRole('dialog',{name:'Celular'});await c.getByRole('button',{name:'Moedas',exact:true}).click();await expect(c.getByLabel(`${valor} moedas`,{exact:true})).toBeVisible();await c.getByRole('button',{name:'Voltar',exact:true}).click();await c.getByRole('button',{name:'Voltar',exact:true}).click();
}
