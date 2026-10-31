# Prompt 01 - Revisar o scaffold e completar o port do protótipo

Cole tudo abaixo no Codex (modo tarefa, repositório `avatar-laura`, branch `main`).

---

Leia `AGENTS.md`, `docs/GDD.md` e `docs/ARTE.md` antes de começar.

Contexto: o repositório já tem um scaffold Phaser 3 + Vite + TypeScript com o protótipo `prototype/my-town-my-world.html` portado para `src/` (cenas Boot, Criador e Parque, missão do Pedrinho em `src/game/missaoPedrinho.ts`, testes em `tests/`). Sua tarefa é **revisar, comparar com o protótipo e deixar a versão Phaser fiel e redonda**.

Faça:

1. Rode `npm ci`, `npm run build`, `npm test` e `npm run check:emojis`. Corrija o que falhar.
2. Abra o protótipo (`prototype/my-town-my-world.html`, abre direto no navegador) e a versão Phaser (`npm run dev`, `http://localhost:5173/avatar-laura/`) lado a lado. Compare com `docs/screenshots/prototipo/` e `docs/screenshots/phaser/`. Corrija diferenças de:
   - posições, escalas e profundidade dos objetos (valores em `docs/ARTE.md`);
   - textos (têm que ser exatamente os do GDD, seção 4);
   - animações: respiração, caminhada com balanço, balanço, escorregador (2 descidas), gangorra, carrossel, dança, aceno da Dona Marta, Bia passeando, balão "!" flutuando, anel de toque, anel pulsante na areia, confete e poeira;
   - recorte do rosto no círculo do diálogo (deve mostrar o rosto centralizado, como no protótipo).
3. Extraia valores mágicos repetidos de `CenaParque.ts` para `src/config/parque.ts` (posições, raios, velocidades), sem mudar o comportamento.
4. Revise o favicon lilás (`public/favicon.svg`, desenhado à mão, sem emoji); melhore se ficar feio em tamanho pequeno.
5. Adicione um teste de fumaça com Playwright: `npm run test:e2e` sobe o `vite preview`, abre o jogo, escolhe o cabelo "Cacheado", entra no parque, conversa com o Pedrinho, cava a areia, escolhe A (confere o conselho), tenta de novo, escolhe B e confere que o `localStorage` `mtmw:progresso:v1` tem `moedas: 15`. Use `@playwright/test` com versão verificada por `npm view @playwright/test version`. Não rode e2e no workflow de deploy, só no `ci.yml` (com `npx playwright install --with-deps chromium`).
6. Atualize `docs/screenshots/phaser/` com novas capturas e o `README.md` se algo mudou.

Não faça: Supabase, multiplayer, novos lugares (são outras etapas). Não troque Phaser 3 por outra versão.

## Critérios de aceite

- [ ] `npm run build`, `npm test`, `npm run check:emojis` e `npm run test:e2e` passam.
- [ ] Criador: 6 cabelos com miniatura em close e nome; selecionado com borda roxa; Laura grande com pulinho ao trocar; escolha persiste ao recarregar.
- [ ] Parque: tocar no chão anda; arrastar a Laura para perto de um brinquedo a coloca nele; tocar em cada objeto faz a ação descrita no GDD 3.3.
- [ ] Missão do Pedrinho com os textos exatos do GDD; A e C mostram o conselho da Dona Marta e "Tentar de novo"; B dá confete e exatamente +15 moedas, uma única vez.
- [ ] "Jogar a missão de novo" reinicia a missão.
- [ ] Funciona no celular em pé e deitado (Scale.FIT), sem rolagem e sem zoom acidental.
- [ ] Nenhum emoji em lugar nenhum. Nenhum erro no console.
- [ ] PR em pt-BR com descrição, como testar, screenshots e checklist acima marcada.
