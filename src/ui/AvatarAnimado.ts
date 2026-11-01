import Phaser from 'phaser';
import { RIGS_AVATAR, peleDoBraco, type RigAvatar } from '../game/recortesAvatar';
import { movimentoAvatar, type PoseAvatar, type MovimentoAvatar } from '../game/movimentoAvatar';

interface Recorte { x: number; y: number; w: number; h: number; px: number; py: number; parte?: keyof MovimentoAvatar }
const RECORTES: Recorte[] = [
  { x: 0, y: 0.8, w: 0.5, h: 0.2, px: 0.42, py: 0.81, parte: 'pernaE' },
  { x: 0.5, y: 0.8, w: 0.5, h: 0.2, px: 0.58, py: 0.81, parte: 'pernaD' },
  { x: 0, y: 0.57, w: 0.28, h: 0.23, px: 0.28, py: 0.6, parte: 'bracoE' },
  { x: 0.72, y: 0.57, w: 0.28, h: 0.23, px: 0.72, py: 0.6, parte: 'bracoD' },
  { x: 0.28, y: 0.57, w: 0.44, h: 0.23, px: 0.5, py: 0.7 },
  { x: 0, y: 0, w: 1, h: 0.57, px: 0.5, py: 0.56, parte: 'cabeca' },
];
const MARTA: Recorte[] = [
  { x: 0, y: 0.56, w: 1, h: 0.44, px: 0.5, py: 0.8 },
  { x: 0.3, y: 0, w: 0.7, h: 0.56, px: 0.55, py: 0.55, parte: 'cabeca' },
  { x: 0, y: 0, w: 0.3, h: 0.2, px: 0.5, py: 0.5 },
  { x: 0, y: 0.2, w: 0.3, h: 0.36, px: 0.29, py: 0.52, parte: 'bracoE' },
];

/** Recortes articulados dos PNGs aprovados, sem duplicar desenhos nem baixar assets. */
export class AvatarAnimado {
  readonly partes: Phaser.GameObjects.Image[];
  private textura = '';
  private recortes: Recorte[];
  private rigLaura = false;

  constructor(readonly imagem: Phaser.GameObjects.Image, marta = false) {
    this.rigLaura = !!RIGS_AVATAR[imagem.texture.key];
    this.recortes = marta ? MARTA : this.rigLaura ? this.recortesLaura(RIGS_AVATAR[imagem.texture.key]) : RECORTES;
    this.partes = this.recortes.map(() => imagem.scene.add.image(0, 0, imagem.texture.key));
    // O marcador original continua responsável pelo hit test e pela âncora dos pés.
    const marcador = imagem as Phaser.GameObjects.Image & {
      renderWebGL: (renderer: Phaser.Renderer.WebGL.WebGLRenderer, src: Phaser.GameObjects.Image, camera: Phaser.Cameras.Scene2D.Camera) => void;
      renderCanvas: (renderer: Phaser.Renderer.Canvas.CanvasRenderer, src: Phaser.GameObjects.Image, camera: Phaser.Cameras.Scene2D.Camera) => void;
    };
    marcador.renderWebGL = (_renderer, src, camera) => { camera.addToRenderList(src) };
    marcador.renderCanvas = (_renderer, src, camera) => { camera.addToRenderList(src) };
    imagem.once('destroy', () => this.partes.forEach(parte => parte.destroy()));
  }

  private recortesLaura(rig: RigAvatar): Recorte[] {
    const braco = (indice: number, parte: 'bracoE' | 'bracoD'): Recorte => {
      const pontos = rig.bracos[indice];
      return { x: 0, y: 0, w: 1, h: 1, px: (pontos[0] + pontos[pontos.length-2]) / (2*rig.largura), py: (pontos[1] + pontos[pontos.length-1]) / (2*rig.altura), parte };
    };
    // Tronco, roupa e cabelo ficam na mesma camada, cobrindo as raízes dos membros.
    return [
      { x: 0, y: 0, w: 1, h: 1, px: rig.quadris[0], py: .825, parte: 'pernaE' },
      { x: 0, y: 0, w: 1, h: 1, px: rig.quadris[1], py: .825, parte: 'pernaD' },
      braco(0,'bracoE'), braco(1,'bracoD'),
      { x: 0, y: 0, w: 1, h: 1, px: .5, py: .7 },
    ];
  }

  private prepararLaura(chave: string, rig: RigAvatar): string[] {
    const texturas = this.imagem.scene.textures;
    const nomes = this.recortes.map((_r,i)=>`rig-contorno:${chave}:${i}`);
    if (nomes.every(nome=>texturas.exists(nome))) return nomes;
    const fonte = this.imagem.texture.getSourceImage() as HTMLImageElement;
    const original = document.createElement('canvas'); original.width=rig.largura; original.height=rig.altura;
    const ctxOriginal = original.getContext('2d', { willReadFrequently: true })!;
    ctxOriginal.drawImage(fonte,0,0);
    const pixels = ctxOriginal.getImageData(0,0,rig.largura,rig.altura).data;
    const mascaras = rig.bracos.map(pontos => {
      const mascara = document.createElement('canvas'); mascara.width=rig.largura; mascara.height=rig.altura;
      const ctx = mascara.getContext('2d')!;
      const xs=pontos.filter((_v,i)=>i%2===0), ys=pontos.filter((_v,i)=>i%2===1);
      const x0=Math.max(0,Math.min(...xs)-6), x1=Math.min(rig.largura,Math.max(...xs)+6);
      const y0=Math.max(0,Math.min(...ys)-2), y1=Math.min(rig.altura,Math.max(...ys)+6);
      // A pele delimita o braço; a margem inclui seu contorno escuro. Assim o
      // cabelo que passa pela mesma região não entra na peça móvel.
      for (let y=y0; y<y1; y++) for (let x=x0; x<x1; x++) {
        const i=(y*rig.largura+x)*4, r=pixels[i],g=pixels[i+1],b=pixels[i+2];
        if (peleDoBraco(r,g,b,pixels[i+3])) ctx.fillRect(x-2,y-2,5,5);
      }
      return mascara;
    });
    return this.recortes.map((_recorte, indice) => {
      const nome = `rig-contorno:${chave}:${indice}`;
      if (texturas.exists(nome)) return nome;
      const margem = indice===4 ? rig.margemEsquerda ?? 0 : 0;
      const textura = texturas.createCanvas(nome,rig.largura+margem,rig.altura);
      if (!textura) throw new Error('Não foi possível preparar o avatar.');
      const ctx = textura.context;
      if (margem) {
        ctx.translate(margem,0);
        // O PNG Coquinhos termina no meio do coquinho esquerdo. Seu contorno
        // externo é completado atrás da imagem com o coquinho direito espelhado.
        ctx.save(); ctx.translate(51,0); ctx.scale(-1,1);
        ctx.drawImage(fonte,127,0,65,70,0,0,65,70); ctx.restore();
      }
      if (indice < 2) {
        ctx.beginPath(); ctx.rect(indice===0 ? 0 : rig.divisao*rig.largura, .81*rig.altura, (indice===0 ? rig.divisao : 1-rig.divisao)*rig.largura, .19*rig.altura); ctx.clip();
      }
      ctx.drawImage(fonte,0,0);
      if (indice===2 || indice===3) { ctx.globalCompositeOperation='destination-in'; ctx.drawImage(mascaras[indice-2],0,0); ctx.globalCompositeOperation='source-over' }
      if (indice === 4) {
        ctx.clearRect(0,.86*rig.altura,rig.largura,rig.altura);
        ctx.globalCompositeOperation='destination-out';
        for (const [i,pontos] of rig.bracos.entries()) {
          // Sobreposição no ombro cobre a junta durante o aceno, sem remover cabelo.
          ctx.save(); ctx.beginPath(); ctx.rect(0,pontos[1]+10,rig.largura,rig.altura); ctx.clip();
          ctx.drawImage(mascaras[i],0,0); ctx.restore();
        }
        ctx.globalCompositeOperation='source-over';
      }
      textura.refresh(); return nome;
    });
  }

  atualizar(pose: PoseAvatar, tempo: number): void {
    const imagem = this.imagem;
    if (!imagem.active) return;
    const w = imagem.width, h = imagem.height;
    if (this.textura !== imagem.texture.key) {
      this.textura = imagem.texture.key;
      if (this.rigLaura) this.recortes = this.recortesLaura(RIGS_AVATAR[this.textura]);
      const preparadas = this.rigLaura ? this.prepararLaura(this.textura,RIGS_AVATAR[this.textura]) : null;
      this.partes.forEach((parte, i) => {
        const r = this.recortes[i];
        if (preparadas) {
          const margem = i===4 ? RIGS_AVATAR[this.textura].margemEsquerda ?? 0 : 0;
          parte.setTexture(preparadas[i]).setOrigin((r.px*w+margem)/(w+margem),r.py); return;
        }
        const x = Math.round(r.x * w), y = Math.round(r.y * h);
        parte.setTexture(this.textura).setCrop(x, y, Math.round((r.x + r.w) * w) - x, Math.round((r.y + r.h) * h) - y).setOrigin(r.px, r.py);
      });
    }
    const movimento = movimentoAvatar(pose, tempo, this.rigLaura ? 'frontal' : 'recortes');
    const cos = Math.cos(imagem.rotation), sin = Math.sin(imagem.rotation);
    this.partes.forEach((parte, i) => {
      const r = this.recortes[i];
      const dx = (r.px - imagem.originX) * w * imagem.scaleX;
      const dy = (r.py - imagem.originY) * h * imagem.scaleY;
      parte.setPosition(imagem.x + dx * cos - dy * sin, imagem.y + dx * sin + dy * cos)
        .setScale(imagem.scaleX, imagem.scaleY)
        .setRotation(imagem.rotation + Phaser.Math.DegToRad(r.parte ? movimento[r.parte] : 0) * Math.sign(imagem.scaleX || 1))
        .setDepth(imagem.depth + (this.rigLaura ? (i===2 || i===3 ? 0.03 : i===4 ? 0.02 : 0.01) : 0.01)).setVisible(imagem.visible).setAlpha(imagem.alpha);
    });
  }
}
