# Prompt 05 - Mapa da cidade, novos lugares e missões por dados

---

Leia `AGENTS.md`, `docs/GDD.md` (seções 2, 4 e 9) e `docs/ARTE.md` (seção "Assets que faltam").

Tarefa: transformar o jogo de "um parque" em "uma cidade", com missões descritas em dados, para ser fácil criar mais lugares, personagens, missões e itens.

Faça:

1. **Sistema de missões por dados**:
   - `src/game/missoes/tipos.ts`: tipos de uma missão (id, título, valor, lugar, personagens, passos, escolhas com texto, conselho gentil para escolhas que não ajudam, recompensa).
   - `src/game/missoes/motor.ts`: motor genérico e puro (sem Phaser) que executa uma missão passo a passo. Escolha que não ajuda sempre mostra conselho e volta; nunca pune; recompensa paga uma vez.
   - Converta a missão do Pedrinho para `public/data/missoes/pedrinho-carrinho.json` mantendo **exatamente** os textos e a recompensa de 15 moedas. Os testes atuais continuam passando (adapte se preciso) e adicione testes do motor.
2. **Mapa da cidade** em Tiled (`public/assets/mapas/cidade.tmj`, tileset em `public/assets/mapas/`), carregado com `this.load.tilemapTiledJSON`. Pode começar simples: ruas e 4 portas (Parque, Casa da Laura, Padaria, Pet Shop). Camada de objetos com as portas (propriedade `cena`). Laura anda no mapa e toca na porta para entrar.
   - Se não houver tileset pronto, gere um tileset simples e bonito em código ou PNG desenhado por você (formas lilases e pastel), sem baixar nada da internet, e registre em `docs/ARTE.md` que precisa de arte final.
3. **Dois lugares novos** com cena própria (fundo provisório desenhado em código se faltar arte):
   - **Padaria**: missão "Troco a mais" (honestidade): a padeira dá troco a mais; A) ficar com o troco, B) avisar e devolver, C) não falar nada. Recompensa 10 moedas.
   - **Pet Shop**: missão "Cuidar do Bolinha" (responsabilidade): dar água, comida e carinho em um filhote (3 passos de toque). Recompensa 10 moedas. Prepara o terreno para "pets adotados como missão".
4. Uma terceira missão no **Parque**: "Esperar a vez" (paciência) com a Bia no escorregador. Recompensa 5 moedas.
5. Tela **Meu diário** (botão no HUD): lista das missões com o valor aprendido e um selo desenhado em código para cada concluída.
6. Se o Supabase estiver ativo, cadastre as missões novas via migração `supabase/migrations/0004_missoes_cidade.sql` (insert em `missions`).
7. Atualize `docs/GDD.md`, `docs/ARTE.md` (assets usados e que faltam) e `docs/ROADMAP.md`.

## Critérios de aceite

- [ ] Laura sai do parque para o mapa da cidade e entra em Padaria, Pet Shop e Casa (Casa pode ser só um quarto vazio com "Em breve").
- [ ] As 4 missões funcionam do começo ao fim, com conselho gentil nas escolhas que não ajudam e recompensa paga uma vez.
- [ ] Missão do Pedrinho idêntica à anterior (textos e 15 moedas).
- [ ] Criar uma missão nova exige só um JSON novo e, se for em lugar novo, uma cena (documentar como no `docs/GDD.md`).
- [ ] Build, testes (incluindo do motor) e check de emojis passam. Sem emojis. PR em pt-BR com prints e checklist.
