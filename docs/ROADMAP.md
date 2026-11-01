# Roadmap

Cada etapa tem um prompt pronto em `prompts/`. Faça uma etapa por vez: cole o prompt no Codex, revise o PR, aprove, confira o site publicado e só então vá para a próxima.

| Etapa | Prompt | Entrega | Status |
|---|---|---|---|
| 01 | `01-scaffold-e-port-do-prototipo.md` | Projeto Phaser + Vite + TS, protótipo portado, testes | Feito neste pacote (o prompt serve para revisar e completar) |
| 02 | `02-deploy-pages.md` | Site publicado no GitHub Pages a cada push | Publicado e validado |
| 03 | `03-supabase-contas-progresso.md` | Login do responsável, perfil, avatar e progresso salvos na nuvem | Publicado; responsável confirmou o funcionamento |
| 03A | `03a-mobile-first-e-motion.md` | Jogo mobile first, câmera, controles por toque e avatares articulados | Publicado; responsável confirmou a conclusão |
| 04 | `04-multiplayer-realtime.md` | Ver amigos aprovados no parque, frases prontas, acenos | Implementado neste PR |
| 05 | `05-novos-lugares-missoes.md` | Mapa da cidade (Tiled), 2 lugares novos, 3 missões novas, sistema de missões por dados | A fazer |

## Depois da etapa 05 (ideias, em ordem sugerida)

1. Painel do responsável: confirmar missões da vida real antes de liberar moedas.
2. Pets adotados como missão (responsabilidade).
3. Loja de roupas e acessórios com moedas do jogo.
4. Família: avatares dos pais vinculados.
5. Alertas por e-mail aos pais (Supabase Edge Function + serviço gratuito de e-mail).
6. Som e música (efeitos suaves, botão de mudo).
7. Artes desenhadas para poses sentadas e caminhada, vistas de lado para todos os cabelos e gangorra em duas peças (articulação procedural já disponível na etapa 03A).
8. Modo criar: lugares, personagens, missões e itens editáveis.
9. PWA (instalar no tablet, funcionar offline).
