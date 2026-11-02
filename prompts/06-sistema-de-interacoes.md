# Etapa 06: sistema de interações por dados

Leia `AGENTS.md`, `docs/INTERACOES.md`, `docs/CASA-E-LUGARES.md` e `docs/ARTE-NECESSARIA.md` antes de começar. Tudo em pt-BR, sem emojis, Phaser 3.90.0, TS strict, sem dependências novas.

## Objetivo
Criar o sistema genérico de objetos interativos descrito em `docs/INTERACOES.md` e provar no parque existente (banco = assento, sorvete = pegável, bebedouro = água) sem quebrar a missão do carrinho.

## Etapas (um commit por etapa, PR único ou PRs pequenos)
1. `src/game/interacao/tipos.ts` e `regras.ts`: tipos `pegavel`, `assento`, `cama`, `aparelho`, `recipiente`, `porta`, `agua`; função pura `aplicarAcao(estado, acao)` que devolve `{ estado, efeitos }`. Testes Vitest para cada tipo.
2. `inventario.ts` (mão 1 + mochila 6) e `travas.ts` (pedido/confirma, expiração 8 s). Testes: dois jogadores pegando o mesmo item, só o primeiro com versão atual ganha.
3. `public/assets/dados/objetos.json` + validação ao carregar (erro claro no console de dev se faltar campo).
4. `src/scenes/interacao/ObjetoInterativo.ts`, `Avatar.ts` (poses com placeholder, ponto `mao`, snaps), `GerenteInteracao.ts`, `Efeitos.ts` (squash, partículas desenhadas, som opcional).
5. Integração no `CenaParque`: banco com 2 snaps, sorvete que vai para a mão e pode ser comido (3 mordidas), bebedouro com gotas. Botão de mochila.
6. Persistência: migration `objetos_estado` com RLS (dono escreve, amigos aprovados leem) e `src/net/objetosSync.ts` com debounce de 1 s e cache local. Atualizar `docs/SUPABASE.md`.
7. Multiplayer: broadcast `pedido/confirma` na sala do convite (PR 5); item na mão da amiga visível; mensagem gentil quando já está com alguém.

## Critérios de aceite
- `npm run test`, `npm run build` e `npm run check:emojis` passam.
- Área de toque mínima 64x64; tudo funciona só com toque simples (arrastar é opcional).
- `depth = y` vale para avatar, objetos e item na mão (mão = avatar + 1).
- Missão do carrinho e NPCs continuam iguais ao protótipo.
- Duas abas na mesma sala: só uma consegue segurar o sorvete; ao fechar a aba, ele volta ao chão em até 8 s.
- Faltas de arte registradas em `docs/ARTE.md`.
- PR com descrição em pt-BR e prints em `docs/screenshots/`.
