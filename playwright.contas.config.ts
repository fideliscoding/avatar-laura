import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/contas',
  timeout: 45_000,
  use: { baseURL: 'http://127.0.0.1:4175/avatar-laura/', viewport: { width: 1280, height: 720 }, launchOptions: { args: ['--disable-webgl'] } },
  webServer: {
    command: 'npm run build -- --outDir work/dist-contas && npm run preview -- --outDir work/dist-contas --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175/avatar-laura/',
    env: { VITE_SUPABASE_URL: 'https://supabase-teste.invalid', VITE_SUPABASE_ANON_KEY: 'chave-publica-de-teste' },
  },
});
