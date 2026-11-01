import Phaser from 'phaser';
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

  constructor(readonly imagem: Phaser.GameObjects.Image, marta = false) {
    this.recortes = marta ? MARTA : RECORTES;
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

  atualizar(pose: PoseAvatar, tempo: number): void {
    const imagem = this.imagem;
    if (!imagem.active) return;
    const w = imagem.width, h = imagem.height;
    if (this.textura !== imagem.texture.key) {
      this.textura = imagem.texture.key;
      this.partes.forEach((parte, i) => {
        const r = this.recortes[i];
        const x = Math.round(r.x * w), y = Math.round(r.y * h);
        parte.setTexture(this.textura).setCrop(x, y, Math.round((r.x + r.w) * w) - x, Math.round((r.y + r.h) * h) - y).setOrigin(r.px, r.py);
      });
    }
    const movimento = movimentoAvatar(pose, tempo);
    const cos = Math.cos(imagem.rotation), sin = Math.sin(imagem.rotation);
    this.partes.forEach((parte, i) => {
      const r = this.recortes[i];
      const dx = (r.px - imagem.originX) * w * imagem.scaleX;
      const dy = (r.py - imagem.originY) * h * imagem.scaleY;
      parte.setPosition(imagem.x + dx * cos - dy * sin, imagem.y + dx * sin + dy * cos)
        .setScale(imagem.scaleX, imagem.scaleY)
        .setRotation(imagem.rotation + Phaser.Math.DegToRad(r.parte ? movimento[r.parte] : 0) * Math.sign(imagem.scaleX || 1))
        .setDepth(imagem.depth + 0.01).setVisible(imagem.visible).setAlpha(imagem.alpha);
    });
  }
}
