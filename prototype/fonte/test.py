import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=await b.new_page(viewport={'width':1280,'height':720})
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None);pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file:///workspace/laura-jogo/v3/my-town-my-world.html');await pg.wait_for_timeout(800)
    await pg.click('.th:nth-child(4)');await pg.wait_for_timeout(600);await pg.screenshot(path='shots/1-criador.png')
    await pg.click('.th:nth-child(1)');await pg.click('#goPark');await pg.wait_for_timeout(300)
    await pg.mouse.click(450,620);await pg.wait_for_timeout(900);await pg.screenshot(path='shots/2-parque.png')
    await pg.evaluate("__game.startRide('balanco')");await pg.wait_for_timeout(1900);await pg.screenshot(path='shots/3-balanco.png')
    await pg.evaluate("__game.startRide('escorregador')");await pg.wait_for_timeout(2600);await pg.screenshot(path='shots/3b-escorregador.png')
    await pg.evaluate("__game.startRide('gangorra')");await pg.wait_for_timeout(1000);await pg.screenshot(path='shots/3c-gangorra.png')
    await pg.evaluate("__game.startRide('carrossel')");await pg.wait_for_timeout(1000);await pg.screenshot(path='shots/3d-carrossel.png')
    await pg.mouse.click(688,520);await pg.wait_for_timeout(4500);await pg.screenshot(path='shots/4a-pedrinho.png')
    await pg.click('#dlgBtns button');await pg.mouse.click(985,555);await pg.wait_for_timeout(5000);await pg.screenshot(path='shots/4-escolha.png')
    await pg.click('#dlgBtns button:nth-child(1)');await pg.wait_for_timeout(400);await pg.screenshot(path='shots/4b-gentil.png')
    await pg.click('#dlgBtns button');await pg.wait_for_timeout(300);await pg.click('#dlgBtns button:nth-child(2)');await pg.wait_for_timeout(2200);await pg.screenshot(path='shots/5-confete.png')
    await pg.wait_for_timeout(3000);await pg.screenshot(path='shots/5b-final.png')
    print('ERRS',errs);await b.close()
asyncio.run(main())
