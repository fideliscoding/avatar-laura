# Deploy no GitHub Pages

O workflow `.github/workflows/deploy.yml` faz tudo sozinho a cada push na branch `main`: instala, testa, verifica emojis, gera o build e publica.

Endereço final: [Abrir o jogo](https://fideliscoding.github.io/avatar-laura/)

## Passo a passo (uma vez só)

1. O repositório precisa se chamar exatamente **`avatar-laura`** (o `vite.config.ts` usa `base: '/avatar-laura/'`). Se mudar o nome, mude o `base` também.
2. No GitHub, abra o repositório > **Settings** > **Pages**.
3. Em **Build and deployment > Source**, escolha **GitHub Actions**.
4. Vá em **Actions**. Se pedir, clique em "I understand my workflows, go ahead and enable them".
5. Rode o workflow: **Actions > Deploy no GitHub Pages > Run workflow** (ou faça qualquer push na `main`).
6. Quando ficar verde (2 a 3 minutos), o link aparece no próprio job "deploy" e em Settings > Pages.

Repositório privado: o GitHub Pages em repositório privado exige plano pago. No plano gratuito, deixe o repositório **público** (não há nada secreto no código; os secrets ficam guardados à parte).

## Secrets do Supabase (a partir da etapa 03)

1. Repositório > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
2. Crie dois:
   - Nome `VITE_SUPABASE_URL`, valor = Project URL (ex.: `https://abcd1234.supabase.co`)
   - Nome `VITE_SUPABASE_ANON_KEY`, valor = chave `anon public`
3. Rode o deploy de novo.

Sem esses secrets o jogo continua funcionando no modo offline (progresso só no navegador).

### Por que a anon key pode ir para o site?

O Vite coloca as variáveis `VITE_*` dentro do JavaScript publicado, então qualquer pessoa pode vê-las no navegador. A **anon key é pública por design**: ela só permite o que as regras RLS do banco permitem (cada jogador acessa apenas os próprios dados). Guardá-la como secret serve só para não deixar o valor solto no código.

A **service_role key** ignora todas as regras e dá acesso total ao banco. Ela **nunca** vai para o repositório, para o código, para secrets de build do front ou para o Codex. Se vazar por engano: Supabase > Project Settings > API > gerar nova chave imediatamente.

## No computador

Nesta etapa, não é necessário criar arquivo de ambiente nem configurar secrets.
`npm ci && npm run build` funciona sem as duas variáveis públicas; o progresso
continua salvo no navegador. Arquivos `.env` e `.env.*` são ignorados pelo Git.
A integração e o exemplo de configuração ficam para a etapa 03.

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| Página em branco, erros 404 de `.js` | `base` diferente do nome do repositório | Ajustar `base` no `vite.config.ts` |
| Workflow falha em "deploy" com erro de permissão | Pages não está em "GitHub Actions" | Settings > Pages > Source = GitHub Actions |
| Falha em `npm ci` | `package-lock.json` ausente ou desatualizado | Rodar `npm install` localmente e subir o lock |
| Falha em `check:emojis` | Algum arquivo tem emoji | Remover o emoji indicado no log |
| Login redireciona para localhost | Site URL do Supabase errada | Ajustar em Authentication > URL Configuration |

## Revisão da publicação (etapa 02)

- Node 22 nos dois workflows; `package-lock.json` versionado e instalação com `npm ci`.
- Majors estáveis confirmadas nas releases oficiais em 01/11/2026:

| Action | Release consultada | Major usada |
|---|---|---|
| [checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | v7.0.1 | v7 |
| [setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | v7.1.0 | v7 |
| [configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | v6.0.0 | v6 |
| [upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | v5.0.0 | v5 |
| [deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | v5.0.1 | v5 |

`public/.nojekyll` é copiado pelo Vite para `dist/.nojekyll`. O prefixo
`/avatar-laura/` permanece no Vite; o Boot usa `import.meta.env.BASE_URL` e a fonte
usa caminho relativo no HTML. Não altere esse prefixo ao publicar neste repositório.

Para conferir o artefato antes de publicar:

```bash
npm ci
npm run build
npm test
npm run check:emojis
npm run preview -- --host 127.0.0.1
```

Abra `http://localhost:4173/avatar-laura/`. Confira o criador, entre no parque
e verifique na aba Network que imagens e fonte respondem sem 404. Com JavaScript
desativado, a página orienta a criança a pedir ajuda a um responsável.

O CI de PRs executa testes, emojis, build e Playwright. E2e não roda no deploy.
O deploy em push na `main` já foi confirmado pelo
[run 41257609810](https://github.com/fideliscoding/avatar-laura/actions/runs/41257609810),
com resultado `success`. Após o merge desta etapa, acompanhe a nova execução em
[Actions](https://github.com/fideliscoding/avatar-laura/actions/workflows/deploy.yml).

Não há credenciais privilegiadas no código ou nos workflows. As menções ao nome
da chave privilegiada nos guias e prompts são instruções de segurança, não valores
de credenciais; preserve esses avisos.

### Resultado da conferência no navegador

| Ambiente | Imagens e fonte | Prefixo correto | Erros de rede/console |
|---|---|---|---|
| preview | 20 recursos carregados | Sim | Nenhum |
| publicado | 20 recursos carregados | Sim | Nenhum |
| dev | 20 recursos carregados | Sim | Nenhum |

A fonte Fredoka foi confirmada com `document.fonts.check`. O preview também
respondeu 200 para `/avatar-laura/.nojekyll`. A descrição, a cor lilás e o aviso
sem JavaScript foram conferidos no build desta etapa. Capturas em
[docs/screenshots/deploy](screenshots/deploy/README.md).
