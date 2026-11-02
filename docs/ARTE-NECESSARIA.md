# Arte necessária (priorizada)

Estilo atual: chibi profissional, pastel, lilás (`#b58cf5`, `#8b55e6`, `#5a2fa8`) com rosa `#f27ab3`, contorno suave, PNG transparente recortado rente, nomes sem acento com hífen, origem (0.5, 1). Nada copiado de outros jogos. Ao entregar, documentar em `docs/ARTE.md` incluindo o ponto `mao` (x, y no PNG).

## P0 (destrava o sistema de interações)
1. Poses da Laura para os 6 cabelos (ou corpo + cabelo em camadas, preferido): `sentada`, `deitada`, `dormindo` (olhos fechados), `segurando` (braço estendido), `andando` 4 quadros, `comendo`.
2. Mesmas poses para Bia e Pedrinho (mínimo sentado e segurando).
3. Expressões em camada de rosto: feliz, surpresa, triste, sono, rindo (reuso no multiplayer como acenos).
4. Fundo da sala e do quarto (1280x720) sem móveis (móveis são sprites separados).
5. Móveis com 2 estados: cama + cobertor separado, sofá, TV ligada/desligada, abajur aceso/apagado, armário/guarda-roupa aberto/fechado.
6. Itens de mão pequenos (~128 px): maçã, suco, pão, ursinho, livro, escova de dentes, toalha.

## P1 (casa completa)
7. Fundos: cozinha, banheiro, quintal, lavanderia.
8. Cozinha: geladeira aberta/fechada, fogão chama on/off, micro-ondas, torradeira, pia, mesa, cadeira, panela, ovo/ovo frito, prato sujo/limpo.
9. Banheiro: box do chuveiro (porta fosca), banheira, sanitário com tampa, pia com espelho, armarinho. Pose `tomando-banho` (ombros para cima, com toalha na saída).
10. Lavanderia: máquina de lavar (tambor separado para girar), varal, cesto, roupa suja/limpa dobrada.
11. Ícones de interface desenhados: mochila, mão, levantar, arrumar tudo, mapa, mudo.
12. Sons curtos (licença livre CC0, registrados com origem): abrir, fechar, clique, água em loop, descarga, plim, mastigar, ronco suave, música da TV/rádio.

## P2 (lugares)
13. Mapa da cidade (tileset Tiled) com fachadas: casa, escola, padaria, clínica, salão, estúdio, centro comunitário, pet shop.
14. Interiores: sala de aula, pátio, padaria, consultório, salão, estúdio, salão comunitário, pet shop (fundo + 4 a 6 objetos cada).
15. Pets (gato, cachorro, coelho) em 3 poses: em pé, sentado, dormindo; e potes de água/ração.
16. Pose `dancando` (2 quadros) e NPCs adultos (padeiro, médica, professora).

Placeholders: enquanto não houver arte, usar `Graphics` lilás com o nome do objeto, como manda o `AGENTS.md`.

## P0+ (etapa 09: modelo de toque, sem botões)
Ver `docs/MODELO-DE-JOGO-AVATAR-WORLD.md` e `prompts/09-modelo-toque-sem-botoes.md`.
17. Celular: ícone do canto (~96 px, celular lilás com capinha de estrela), moldura do celular aberto, tela inicial e telas dos apps.
18. Ícones dos apps (~128 px, sem texto): Personagens, Mapa, Amigos, Moedas, Sair; seta Voltar.
19. Ícones de emoção desenhados (sem emoji, ~96 px): feliz, triste, surpresa, bravo de leve, sono; fundo da barrinha flutuante.
20. Poses em camadas para Laura, Bia e Pedrinho: `sentada`, `deitada`, `segurando` (com ponto `mao`), `de-toalha`, `no-ar` (pernas balançando, para arrastar).
21. Expressões em camada de rosto: `dormindo`, `doente` (rosto vermelho, olhos em espiral), `feliz`, `triste`, `surpresa`, `comendo` (boca aberta), piscada.
22. Mapa isométrico da cidade: chão, ruas, fachadas isométricas (casa, escola, padaria, clínica, salão, estúdio, centro comunitário, pet shop, parque), selo NOVO (estrela pulsante), carros, ônibus e bicicletas de enfeite, sol e lua, variações de céu (manhã, tarde, pôr do sol, noite).
23. Caixa surpresa (fechada, aberta, tampa separada), sacolas (padaria e papelaria), mochila aberta/fechada, confete e estrelas, migalhas, item mordido em 3 estágios (maçã, pão).
24. Segredos: quadro que vira, tijolo solto, toca no rodapé, estrela no teto, adesivos do álbum.
25. Brinquedos do parque com encaixe: balanço, escorregador, gangorra.
26. Versão com contorno grosso (4 a 6 px `#5a2fa8`) dos objetos interativos já existentes.
