# Guia do Bruno: do zip ao jogo publicado

Tudo aqui é feito pelo navegador ou pelo GitHub Desktop. Não precisa programar. Leva uns 20 minutos na primeira vez.

## Visão geral

1. Criar o repositório `avatar-laura` no GitHub.
2. Subir os arquivos deste pacote.
3. Ligar o GitHub Pages (o jogo já fica no ar).
4. Conectar o Codex ao repositório.
5. Para cada etapa: colar o prompt no Codex, revisar o PR, aprovar.
6. Na etapa 03: criar o Supabase e colocar os secrets.

---

## Passo 1. Criar o repositório

1. Entre em https://github.com e clique no **+** (canto superior direito) > **New repository**.
2. Repository name: **`avatar-laura`** (exatamente assim, minúsculo, com hífen).
3. Marque **Public** (o GitHub Pages gratuito exige repositório público; não há nada secreto no código).
4. **Não** marque "Add a README", nem .gitignore, nem licença (o pacote já tem).
5. Clique em **Create repository**.

## Passo 2. Subir os arquivos

Descompacte `avatar-laura-pacote.zip`. Vai aparecer a pasta `avatar-laura` com tudo dentro (README.md, AGENTS.md, src, docs...).

### Opção A: GitHub Desktop (recomendada)

1. Instale o GitHub Desktop (https://desktop.github.com) e entre com sua conta.
2. **File > Clone repository**, escolha `avatar-laura` e uma pasta no computador. Clique em **Clone**.
3. Abra a pasta clonada (**Repository > Show in Explorer/Finder**).
4. Copie **todo o conteúdo** da pasta `avatar-laura` descompactada para dentro dessa pasta (inclusive as pastas ocultas `.github` e os arquivos `.gitignore`, `.env.example`, `.nvmrc`; no Mac aperte Cmd+Shift+. para ver ocultos; no Windows, Exibir > Itens ocultos).
5. Volte ao GitHub Desktop. Na caixa "Summary" escreva `Pacote inicial do jogo` e clique em **Commit to main**.
6. Clique em **Push origin**.

### Opção B: só pelo navegador

1. Na página do repositório vazio, clique em **uploading an existing file**.
2. Abra a pasta `avatar-laura` descompactada, selecione **tudo** e arraste para a página.
3. Atenção: o upload pelo navegador às vezes ignora a pasta oculta `.github`. Depois do commit, confira se existe `.github/workflows/deploy.yml` no repositório. Se não existir:
   - Clique em **Add file > Create new file**.
   - No nome, digite `.github/workflows/deploy.yml` (as barras criam as pastas).
   - Cole o conteúdo do arquivo `deploy.yml` do pacote e clique em **Commit changes**.
   - Repita para `.github/workflows/ci.yml`.
4. Escreva `Pacote inicial do jogo` e clique em **Commit changes**.

## Passo 3. Ligar o GitHub Pages

1. No repositório: **Settings** > menu da esquerda **Pages**.
2. Em **Build and deployment > Source**, escolha **GitHub Actions**.
3. Vá na aba **Actions**. Se aparecer um botão para habilitar workflows, clique nele.
4. Clique em **Deploy no GitHub Pages** > **Run workflow** > **Run workflow**.
5. Espere ficar verde (2 a 3 minutos). Abra `https://SEU-USUARIO.github.io/avatar-laura/`. O jogo já funciona!

Se ficar vermelho, clique no item vermelho, copie a mensagem de erro e cole no Codex pedindo: "O deploy falhou com este erro, corrija seguindo o AGENTS.md".

## Passo 4. Conectar o Codex

1. Entre em https://chatgpt.com/codex.
2. Conecte sua conta do GitHub e dê acesso ao repositório `avatar-laura`.
3. Crie um ambiente (environment) para o repositório. Em "Setup script" coloque: `npm ci`.
4. O Codex lê o `AGENTS.md` sozinho em toda tarefa.

## Passo 5. Etapas com o Codex

Para cada etapa: abra o arquivo do prompt no GitHub (pasta `prompts/`), copie **tudo** que está abaixo da linha `---` e cole no Codex como uma nova tarefa no repositório `avatar-laura`, branch `main`.

| Ordem | Arquivo do prompt | O que você ganha | Antes de colar |
|---|---|---|---|
| 1 | `prompts/01-scaffold-e-port-do-prototipo.md` | Jogo revisado, fiel ao protótipo, com teste automático | Nada |
| 2 | `prompts/02-deploy-pages.md` | Publicação automática conferida, link no README | Passo 3 feito |
| 3 | `prompts/03-supabase-contas-progresso.md` | Login do responsável, progresso salvo na nuvem | Passo 6 feito |
| 3A | `prompts/03a-mobile-first-e-motion.md` | Jogo mobile first, câmera e movimentos dos avatares | Etapa 3 publicada |
| 4 | `prompts/04-multiplayer-realtime.md` | Brincar com amigos aprovados, frases prontas | Etapas 3 e 3A publicadas |
| 5 | `prompts/05-novos-lugares-missoes.md` | Mapa da cidade, padaria, pet shop, novas missões | Etapa 4 publicada (ou pode vir antes da 4, se preferir) |

Uma etapa por vez. Só comece a próxima depois de aprovar e conferir a anterior no site.

## Como revisar e aprovar o PR

1. Quando o Codex terminar, clique em **Create PR** (ou "Abrir PR") na tarefa.
2. No GitHub, aba **Pull requests**, abra o PR.
3. Leia a descrição: o que mudou, prints e a lista de critérios de aceite marcada.
4. Olhe o resultado dos checks no fim da página (**CI**). Precisa estar verde. Se estiver vermelho, peça no Codex: "O CI do PR falhou, corrija".
5. Quer testar antes? Na tarefa do Codex há o diff; você também pode baixar a branch pelo GitHub Desktop e rodar `npm install` e `npm run dev`. Não é obrigatório.
6. Algo não ficou bom? Comente no PR ou volte na tarefa do Codex e peça o ajuste em uma frase clara ("A Laura está pequena demais no parque, volte para altura 172").
7. Tudo certo: botão verde **Merge pull request** > **Confirm merge**.
8. O deploy roda sozinho. Em 2 a 3 minutos o site está atualizado (recarregue com Ctrl+F5).

## Passo 6. Supabase e secrets (só antes da etapa 3)

1. Crie o projeto conforme `docs/SUPABASE.md` (nome `avatar-laura`, região São Paulo).
2. **SQL Editor > New query**: cole todo o arquivo `supabase/migrations/0001_init.sql` e clique em **Run**.
3. **Authentication > URL Configuration**: Site URL = `https://SEU-USUARIO.github.io/avatar-laura/`.
4. **Project Settings > API**: copie a **Project URL** e a chave **anon public**.
5. No GitHub: repositório > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:
   - `VITE_SUPABASE_URL` = a Project URL
   - `VITE_SUPABASE_ANON_KEY` = a chave anon public
6. A chave **service_role** nunca vai para o GitHub, nem para o Codex, nem para ninguém.

A anon key é pública de propósito (ela vai dentro do jogo no navegador). Quem protege os dados são as regras do banco (RLS) que já estão no SQL.

## Dicas

- Guarde este pacote zip como backup.
- Se o Codex sugerir trocar Phaser, usar Lovable ou colocar chat livre, recuse: o `AGENTS.md` proíbe.
- Ideias novas: escreva um pedido curto no Codex dizendo "Siga o AGENTS.md" e descreva o que quer e como saber que ficou pronto.
