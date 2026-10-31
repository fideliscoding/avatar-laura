# Prompt 02 - Publicar no GitHub Pages

Antes de colar: no GitHub, Settings > Pages > Source = **GitHub Actions** (veja `GUIA-DO-BRUNO.md`, passo 4).

---

Leia `AGENTS.md` e `docs/DEPLOY.md`.

Tarefa: garantir que o jogo seja publicado automaticamente em `https://<usuario>.github.io/avatar-laura/` a cada push na `main`.

Faça:

1. Revise `.github/workflows/deploy.yml` e `.github/workflows/ci.yml`. Confirme as versões das actions no GitHub (`actions/checkout`, `actions/setup-node`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`) e use a major mais recente estável de cada uma. Node 22.
2. Confirme que `vite.config.ts` tem `base: '/avatar-laura/'` e que todos os assets carregam com esse prefixo (o `CenaBoot` usa `import.meta.env.BASE_URL`; a fonte no `index.html` usa caminho relativo). Teste com `npm run build && npm run preview` e abra `http://localhost:4173/avatar-laura/`.
3. Garanta que `package-lock.json` existe e está em dia (o workflow usa `npm ci`).
4. Confirme que `public/.nojekyll` existe e vai para o `dist/`.
5. Adicione ao `index.html` metatags básicas (descrição em pt-BR, `theme-color` lilás) e um aviso amigável em `<noscript>`.
6. Faça o build tolerar a ausência dos secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (o jogo roda offline).
7. Adicione no `README.md` o selo de status do workflow e o link do jogo publicado.

## Critérios de aceite

- [ ] Push na `main` dispara "Deploy no GitHub Pages" e termina verde.
- [ ] O link publicado abre o jogo, carrega todas as imagens e a fonte (sem 404 no console).
- [ ] PRs rodam o `ci.yml` (testes, emojis, build).
- [ ] Nenhuma chave secreta no repositório. `service_role` não aparece em lugar nenhum.
- [ ] `docs/DEPLOY.md` atualizado se algo mudou.
