import { defineConfig } from 'vite';

// base precisa ser o nome do repositório para funcionar no GitHub Pages:
// https://<usuario>.github.io/avatar-laura/
export default defineConfig({
  base: '/avatar-laura/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: { manualChunks: { phaser: ['phaser'] } },
    },
  },
  server: { port: 5173 },
});
