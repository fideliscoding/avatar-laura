import asyncio, json
from playwright.async_api import async_playwright
U='http://localhost:8765/index.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1366,'height':860})
        errs=[]; pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.evaluate('localStorage.clear()'); await pg.reload()
        await pg.wait_for_function('window.MTMW&&MTMW.pronto()',timeout=60000); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='shots-v2/ui-1-franja.png')
        await pg.evaluate("MTMW.aba('olhos')"); await pg.wait_for_timeout(300); await pg.screenshot(path='shots-v2/ui-2-olhos.png')
        await pg.evaluate("MTMW.aba('roupaCima')"); await pg.click('.item.on'); await pg.wait_for_timeout(100)
        await pg.locator('.cor').nth(6).click(); await pg.wait_for_timeout(250); await pg.screenshot(path='shots-v2/ui-3-cor-por-peca-reacao-feliz.png')
        await pg.evaluate("MTMW.set({roupaCima:null,roupaBaixo:null,vestido:null,acessorios:[]})"); await pg.evaluate("MTMW.aba('roupaBaixo')"); await pg.wait_for_timeout(300); await pg.screenshot(path='shots-v2/ui-4-sem-roupa-triste.png')
        await pg.evaluate("MTMW.set({})"); await pg.click('#sortear'); await pg.wait_for_timeout(1300); await pg.screenshot(path='shots-v2/ui-5-sortear.png')
        print('\n'.join(errs[:10]))
        await b.close()
asyncio.run(main())
