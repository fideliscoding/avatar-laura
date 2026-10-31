# My Town, My World (Minha Cidade, Meu Mundo)

Jogo para a Laura (9 anos) criar o próprio visual, passear por uma cidade em estilo chibi lilás e aprender valores do dia a dia (honestidade, empatia, gentileza, responsabilidade, cuidado com os outros e com o mundo) por meio de missões curtas com escolhas.

Inspirado no estilo de jogos de "vida em cidade" para crianças, **sem copiar** personagens, nomes, telas ou artes de nenhum jogo existente. Sem emojis em lugar nenhum.

![Criador de visual](docs/screenshots/phaser/1-criador.png)
![Missão do Pedrinho](docs/screenshots/phaser/2-escolha.png)

## O que já funciona (versão 0.1)

- Tela **Crie o seu visual** com 6 cabelos (Liso, Rabo de cavalo, Tranças, Cacheado, Coque, Coquinhos).
- **Parque** com balanço, escorregador, gangorra, carrossel, carrinho de sorvete, caixa de areia, Bia (amiga que passeia), Dona Marta (vovó no banco) e Pedrinho.
- Andar tocando no chão ou arrastando a Laura até um brinquedo.
- **Missão "O carrinho do Pedrinho"** (honestidade e empatia) com escolhas A/B/C, conselho gentil nas escolhas erradas, confete e +15 moedas.
- Progresso salvo no navegador (cabelo, moedas, missões).

Este código é a portabilidade do protótipo aprovado (`prototype/my-town-my-world.html`) para Phaser 3 + Vite + TypeScript.

## Tecnologias (todas gratuitas)

| Parte | Ferramenta |
|---|---|
| Motor do jogo | Phaser 3.90.0 |
| Build | Vite 7.3.7 + TypeScript 5.9.3 |
| Testes | Vitest 4.1.12 |
| Mapas (próximas etapas) | Tiled (arquivos .tmj em `public/assets/mapas/`) |
| Contas, banco e multiplayer (etapas 03 e 04) | Supabase (Auth, Postgres com RLS, Realtime) |
| Hospedagem | GitHub Pages via GitHub Actions |

## Como rodar no computador

Precisa do [Node.js 22](https://nodejs.org/) (funciona a partir do 20.19).

```bash
npm install
npm run dev        # abre em http://localhost:5173/avatar-laura/
npm test           # testes de lógica
npm run build      # gera a pasta dist/
npm run preview    # serve o dist/ para conferir
npm run check:emojis
```

## Publicar

Cada push na branch `main` publica automaticamente em `https://<seu-usuario>.github.io/avatar-laura/`. Passo a passo em [docs/DEPLOY.md](docs/DEPLOY.md) e, bem simples, em [GUIA-DO-BRUNO.md](GUIA-DO-BRUNO.md).

## Mapa do repositório

```
AGENTS.md                 regras para o Codex (ler antes de qualquer tarefa)
GUIA-DO-BRUNO.md          passo a passo para subir e conduzir o projeto
docs/                     GDD, roadmap, arte, Supabase, deploy, screenshots e referências
prompts/                  pedidos prontos para colar no Codex, um por etapa
prototype/                protótipo HTML aprovado (referência visual e de comportamento)
public/assets/            imagens (PNG transparentes), cenário e fonte
src/                      código do jogo (cenas, lógica, interface)
tests/                    testes Vitest
supabase/migrations/      SQL do banco com RLS
.github/workflows/        deploy no Pages e CI dos PRs
```

## Segurança infantil

Sem chat livre: toda comunicação é por frases prontas. Sem coleta de dados pessoais da criança além de um apelido. Conta criada pelo responsável. Detalhes em `AGENTS.md` e `docs/SUPABASE.md`.

## Créditos

Fonte Fredoka (SIL Open Font License 1.1). Artes geradas para este projeto.
