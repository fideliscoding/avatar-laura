import { expect, test } from '@playwright/test';
import type Phaser from 'phaser';
import { CABELOS } from '../../src/config/assets';
import { botao, textos } from '../apoio/jogo';

test('seis cabelos conservam a silhueta e as peças cobrem todos os pixels opacos', async ({ page }) => {
  await page.goto('./'); await expect.poll(()=>textos(page)).toContain('Crie o seu visual');
  await botao(page,'Ir para o parque');
  const resultados = await page.evaluate(chaves => {
    type Rig = { partes: Phaser.GameObjects.Image[]; atualizar(pose: 'parada' | 'sentar' | 'acenar', tempo: number): void };
    const cena=window.__jogo.scene.getScene('Parque');
    const animador=(cena as unknown as { animadores: { laura: Rig } }).animadores.laura;
    const Modelo=Object.getPrototypeOf(animador).constructor as new (img: Phaser.GameObjects.Image)=>Rig;
    return chaves.map(chave=>{
      const img=cena.add.image(0,0,chave).setVisible(false), rig=new Modelo(img);
      rig.atualizar('parada',0);
      const w=img.width,h=img.height;
      const original=document.createElement('canvas');original.width=w;original.height=h;
      const ctx=original.getContext('2d')!;ctx.drawImage(img.texture.getSourceImage() as HTMLImageElement,0,0);
      const fonte=ctx.getImageData(0,0,w,h).data;
      const corpo=rig.partes[4].texture.getSourceImage() as HTMLCanvasElement;
      const margem=corpo.width-w;
      const base=corpo.getContext('2d')!.getImageData(margem,0,w,h).data;
      let cabeloAlterado=0;
      const pontas: Record<string,readonly [number,number]> = { 'laura-liso':[20,215], 'laura-trancas':[10,245], 'laura-rabo':[37,210] };
      const ponta=pontas[chave];
      if(ponta) { const i=(ponta[1]*w+ponta[0])*4; for(let c=0;c<4;c++) if(fonte[i+c]!==base[i+c]) cabeloAlterado++ }
      for(let i=0;i<Math.floor(h*.54)*w*4;i+=4) if(fonte[i+3]===255) {
        for(let c=0;c<4;c++) if(fonte[i+c]!==base[i+c]) cabeloAlterado++;
      }
      let margemCortada=0,coquinhoCompleto=true;
      if(margem) {
        const borda=corpo.getContext('2d')!.getImageData(0,0,1,70).data;
        for(let i=3;i<borda.length;i+=4) if(borda[i]) margemCortada++;
        const preenchimento=corpo.getContext('2d')!.getImageData(0,0,margem,70).data;
        coquinhoCompleto=preenchimento.some((v,i)=>i%4===3 && v>0);
      }
      ctx.clearRect(0,0,w,h);
      for(const parte of rig.partes) { const textura=parte.texture.getSourceImage() as HTMLCanvasElement; ctx.drawImage(textura,w-textura.width,0) }
      const composto=ctx.getImageData(0,0,w,h).data;
      let pixelsPerdidos=0;
      for(let i=3;i<fonte.length;i+=4) if(fonte[i]===255 && composto[i]!==255) pixelsPerdidos++;
      rig.atualizar('sentar',.5);
      const angulos=rig.partes.slice(0,2).map(p=>p.angle);
      img.destroy();return {chave,cabeloAlterado,pixelsPerdidos,angulos,margemCortada,coquinhoCompleto};
    });
  },CABELOS.map(c=>c.key));
  for(const r of resultados){
    expect(r.cabeloAlterado,r.chave).toBe(0);
    expect(r.pixelsPerdidos,r.chave).toBe(0);
    expect(r.margemCortada,r.chave).toBe(0); expect(r.coquinhoCompleto,r.chave).toBe(true);
    expect(r.angulos[0]).toBeCloseTo(-r.angulos[1]);
    expect(Math.abs(r.angulos[0])).toBeLessThanOrEqual(17);
  }
});
