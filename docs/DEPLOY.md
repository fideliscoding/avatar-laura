# Deploy no GitHub Pages

O workflow `.github/workflows/deploy.yml` faz tudo sozinho a cada push na branch `main`: instala, testa, verifica emojis, gera o build e publica.

Endereço final: `https://<seu-usuario>.github.io/avatar-laura/`

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

Copie `.env.example` para `.env.local` e preencha. `.env.local` está no `.gitignore`.

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| Página em branco, erros 404 de `.js` | `base` diferente do nome do repositório | Ajustar `base` no `vite.config.ts` |
| Workflow falha em "deploy" com erro de permissão | Pages não está em "GitHub Actions" | Settings > Pages > Source = GitHub Actions |
| Falha em `npm ci` | `package-lock.json` ausente ou desatualizado | Rodar `npm install` localmente e subir o lock |
| Falha em `check:emojis` | Algum arquivo tem emoji | Remover o emoji indicado no log |
| Login redireciona para localhost | Site URL do Supabase errada | Ajustar em Authentication > URL Configuration |
