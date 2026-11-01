# Arte: assets, nomes, âncoras e escalas

Estilo: chibi profissional, pastel, paleta lilás, contorno suave. PNG transparente, recortado rente. Nomes em minúsculas com hífen e sem acento. Nada de emojis. Não copiar artes de jogos existentes.

Palco: 1280x720. Todas as posições abaixo são do protótipo aprovado e estão em `src/config/parque.ts`, consumidas por `src/scenes/CenaParque.ts`.

**Âncora padrão:** personagens e objetos de chão usam origem (0.5, 1), ou seja, o ponto (x, y) é o meio dos pés/base. Profundidade (`depth`) = y.

**Escala:** o tamanho na tela é definido por largura/altura-alvo, mantendo a proporção (`scale = min(larguraAlvo / larguraPng, alturaAlvo / alturaPng)`).

## Assets atuais

### Cenário
| Arquivo | Tamanho PNG | Uso |
|---|---|---|
| `public/assets/cenarios/parque.jpg` | 1280x720 | Fundo do parque (e desfocado no criador). Origem (0,0) |

### Laura (`public/assets/personagens/laura/`)
| Arquivo | PNG | Na tela | Âncora |
|---|---|---|---|
| `laura-frente-liso.png` | 222x385 | parque: alvo 107x172; criador: alvo 320x520 | (0.5, 1) |
| `laura-frente-rabo.png` | 208x406 | idem | (0.5, 1) |
| `laura-frente-trancas.png` | 178x384 | idem | (0.5, 1) |
| `laura-frente-cacheado.png` | 240x385 | idem | (0.5, 1) |
| `laura-frente-coque.png` | 164x395 | idem | (0.5, 1) |
| `laura-frente-coquinhos.png` | 193x392 | idem | (0.5, 1) |
| `laura-lado-liso.png` | 434x840 | andando, só com cabelo liso; espelhada com `scaleX` negativo para a esquerda | (0.5, 1) |

Miniaturas do criador: a mesma imagem com altura 375 px (150 x 2,5), mostrando só a cabeça (máscara arredondada de 150 px).

### NPCs (`public/assets/personagens/npcs/`)
| Arquivo | PNG | Posição (x, y dos pés) | Alvo |
|---|---|---|---|
| `pedro-triste.png` | 270x546 | (688, 600) | altura 150, largura 99 |
| `pedro-feliz.png` | 356x552 | (688, 600) | altura 150, largura 135 |
| `bia.png` | 279x415 | anda entre (455, 445) e (560, 352) | altura 148, largura 111 |
| `vovo.png` | 348x438 | base (1158, 530), largura 232 | origem (0.7, 1) para o aceno girar perto da mão |

### Objetos (`public/assets/objetos/`)
| Arquivo | PNG | Posição | Largura na tela | Observação |
|---|---|---|---|---|
| `balanco-estrutura.png` | 510x448 | canto sup. esq. (230, 150) | 300 | depth 300. Pivô das correntes em (241, 44) do PNG; vão entre correntes 108 px do PNG |
| `balanco-assento.png` | 186x47 | no fim das correntes (190 px) | 92 | correntes desenhadas em código (cinza, elos) |
| `escorregador.png` | 710x709 | base (660, 338) | 272 | trajeto da Laura: 9 pontos relativos em `CURVA_ESC` |
| `gangorra.png` | 500x187 | base (830, 446) | 250 | dividida: base = 42% de baixo; tábua = 44% de cima, pivô a 36% da altura |
| `carrossel.png` | 350x472 | base (180, 528) | 190 | Laura orbita raio 62x14 |
| `carrinho-sorvete.png` | 357x501 | base (1185, 330) | 128 | só fala |
| `carrinho-azul.png` | 333x226 | surge em (985, 575) | 92 | objeto da missão |

### Fonte
`public/assets/fontes/Fredoka.ttf` (variável 300 a 700, SIL OFL 1.1).

### Interface (desenhada em código)
Botões roxos e rosa com sombra, caixa de diálogo branca com borda lilás e rosto em círculo, balão "!", moeda dourada com estrela, anel de toque, anel pulsante de dica, confete (7 cores) e poeira de areia.

## Referências
`docs/referencias/` tem as folhas originais de arte (`ref-cabelos.jpg`, `ref-parque.jpg`, `pedrinho.jpg` etc.) de onde os PNGs foram recortados. `docs/screenshots/prototipo/` mostra o protótipo aprovado e `docs/screenshots/phaser/` a versão Phaser.

## Assets que faltam

Prioridade alta (resolvem as limitações conhecidas):
- [ ] `laura-lado-<cabelo>.png` para rabo, tranças, cacheado, coque e coquinhos (hoje só existe o liso).
- [ ] `laura-sentada-<cabelo>.png` (balanço, gangorra, banco, carrossel).
- [ ] `gangorra-base.png` e `gangorra-tabua.png` separadas.
- [ ] `vovo-acenando-1.png`, `vovo-acenando-2.png` (quadros do aceno) ou braço separado.
- [ ] Ciclo de caminhada (4 a 6 quadros) para Laura, Bia e Pedrinho.
- [ ] Sons: toque de botão, moeda, confete, areia, música de fundo calma.

Para as próximas etapas:
- [ ] Tileset do mapa da cidade (ruas, calçadas, grama, casas) para o Tiled.
- [ ] Lugares: casa da Laura, escola, padaria, pet shop (fundo + objetos).
- [ ] Roupas e acessórios em camadas (base do corpo + roupa + cabelo), para o criador crescer.
- [ ] Pets (gato, cachorro, coelho) em 2 humores.
- [ ] Ícones das frases prontas e acenos do multiplayer (desenhados, nunca emojis).
- [ ] Avatares de adultos (pais) no mesmo estilo.
- [x] Favicon lilás em `public/favicon.svg`: coroa branca e ponto dourado, vetorial e legível em 16 e 32 px. O ícone de instalação do app fica para uma etapa futura.

Ao criar um asset novo: adicione em `src/config/assets.ts`, documente aqui (arquivo, tamanho, âncora, posição, largura) e marque o item.

## Revisão do port (etapa 01)

Criador com fundo pastel e halo suave, seis closes, seleção persistente e pulinho.
O recorte dos diálogos usa a posição vertical de 8% do excedente da imagem,
como `background-position: 50% 8%` no protótipo. Capturas atualizadas em
`docs/screenshots/phaser/`, incluindo carrossel e escorregador.
