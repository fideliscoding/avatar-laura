# Etapa 03A - Jogo mobile first e movimentos dos avatares

Prioridade solicitada antes do multiplayer. Leia `AGENTS.md`, `docs/GDD.md` e
`docs/ARTE.md`. Preserve o mundo lógico de 1280x720, a missão, os textos e o saldo;
adapte a apresentação à área visual disponível, inclusive teclado e áreas seguras.

## Escopo

- Responsividade do parque inteiro, login, criador, HUD e diálogos.
- Câmera que acompanha Laura, destinos acessíveis e toque/arrasto no mundo.
- Interface em pixels visíveis, alvos de pelo menos 44 px e respostas legíveis.
- Movimento de membros, cabeça, passos, aceno, comemoração e poses nos brinquedos.
- Mesma lógica para seis cabelos e NPCs, preservando as artes e o estilo aprovados.
- Registrar limites da articulação e artes ainda ausentes sem afirmar que foram criadas.
- Testes de missão por toque, rotação durante diálogo, área de teclado, câmera e poses.
- Sem multiplayer ou alterações de banco nesta etapa.

## Critérios de aceite

- [ ] Canvas ocupa o viewport em 298x567, 390x844, 567x298 e 844x390.
- [ ] Criador e conta têm layout utilizável e preservam os valores ao redimensionar.
- [ ] Parque acompanha a Laura e permite alcançar todos os destinos.
- [ ] Toque e arrasto usam as coordenadas corretas da câmera.
- [ ] Missão completa por toque, incluindo conselho, tentativa, B e 15 moedas.
- [ ] Diálogo e opções continuam acessíveis após girar o aparelho.
- [ ] Membros se movem independentemente; cabelos, passos e poses são preservados.
- [ ] NPCs têm passos, aceno e comemoração; limitações de arte estão documentadas.
- [ ] Build, testes de lógica, duas suítes Playwright e emojis passam.
- [ ] PR em pt-BR com capturas, vídeo e evidências de validação.
