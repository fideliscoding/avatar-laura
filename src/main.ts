import Phaser from 'phaser';
import { CenaBoot } from './scenes/CenaBoot';
import { CenaCriador } from './scenes/CenaCriador';
import { CenaParque } from './scenes/CenaParque';
import { CenaEntrar } from './scenes/CenaEntrar';
import { supabase } from './net/supabase';
import { jogarOffline } from './net/sessao';
import { CenaInterface } from './scenes/CenaInterface';
import { CORES } from './config/assets';

export const LARGURA = 1280;
export const ALTURA = 720;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'jogo',
  width: LARGURA,
  height: ALTURA,
  backgroundColor: CORES.fundo,
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
  dom: { createContainer: true },
  render: { antialias: true, pixelArt: false },
  scene: [CenaBoot, CenaEntrar, CenaCriador, CenaParque, CenaInterface],
};

const jogo = new Phaser.Game(config);
// Gancho para testes automatizados e depuracao (equivalente ao window.__game do prototipo).
(window as unknown as { __jogo: Phaser.Game }).__jogo = jogo;

// Encerrar a sessão em outra aba também interrompe a sincronização desta aba.
supabase?.auth.onAuthStateChange(evento => {
  if (evento === 'SIGNED_OUT') queueMicrotask(() => {
    jogarOffline();
    jogo.scene.getScenes(true).forEach(cena => jogo.scene.stop(cena.scene.key));
    jogo.scene.start('Entrar');
  });
});

// O viewport visual diminui com o teclado e com as barras do navegador mobile.
function ajustarViewport(): void {
  document.documentElement.style.setProperty('--altura-visivel', `${window.visualViewport?.height ?? innerHeight}px`);
  const parent = document.getElementById('jogo');
  if (parent) jogo.scale.resize(parent.clientWidth, parent.clientHeight);
}
window.visualViewport?.addEventListener('resize', ajustarViewport);
window.addEventListener('resize', ajustarViewport);
ajustarViewport();
