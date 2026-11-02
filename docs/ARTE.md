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

## Articulação e enquadramento mobile (etapa 03A)

Nenhuma imagem foi baixada ou substituída. `src/ui/AvatarAnimado.ts` articula os membros dos PNGs com pivôs normalizados.
Para Laura e amigos, cabeça, cabelo e tronco ficam unidos, conforme a correção
explicada abaixo; os NPCs usam os recortes anteriores. As texturas originais continuam centralizadas em
`src/config/assets.ts`. A âncora e o marcador de interação conservam os pés e a
profundidade por y. Marta usa um recorte próprio do braço levantado.

`src/game/movimentoAvatar.ts` define passos alternados, respiração, pernas
inclinadas para sentar/escorregar, aceno e dança. É lógica pura com testes.
A mesma articulação funciona nos seis cabelos; a direção horizontal é espelhada.
Cabeça e membros mantêm o desenho aprovado, com a limitação visual de recortes:
não são poses novas desenhadas e pode haver pequenas emendas nas articulações.
As folhas de caminhada, vistas de lado completas e poses sentadas desenhadas
permanecem na lista de assets que faltam. Somente as transformações e os recortes
são novos, portanto não há PNG novo a registrar.

Capturas e gravação de movimento em [screenshots/mobile](screenshots/mobile/README.md).

## Multiplayer (etapa 04)

Os amigos reutilizam `AvatarAnimado` e os seis cabelos existentes, com etiqueta
de apelido e balão de frase. O coração é um contorno preenchido desenhado com
`Graphics` e animado por tween; aceno e pulo usam o rig atual. Não há imagens
novas nem dependências de arte externas. Capturas em
[screenshots/multiplayer](screenshots/multiplayer/README.md).

## Correção das juntas e do cabelo dos avatares

A Laura local e os amigos agora usam regiões próprias para cada um dos seis PNGs,
definidas em `src/game/recortesAvatar.ts`. Cabeça, cabelo, tronco e saia ficam juntos;
não há corte horizontal atravessando o cabelo. Os braços são separados pela pele
nas regiões delimitadas, com margem para o contorno, e desenhados à frente do
corpo. As pernas começam abaixo da saia, com sobreposição nas juntas e pivôs
adaptados a cada cabelo. A pose frontal sentada usa ângulos pequenos e opostos,
em vez de girar as duas pernas para o mesmo lado. O aceno aponta para fora do corpo.
Balanço e gangorra apoiam o avatar na base da saia (origem y 0,79), em vez
de prender o assento na altura do tronco. Essa origem também é transmitida aos amigos.

As cinco texturas transparentes por cabelo são preparadas uma única vez em
CanvasTexture e reutilizadas por avatares locais/remotos, tanto no renderizador
Canvas quanto no WebGL. Os PNGs aprovados continuam intactos. O coquinho esquerdo, que já vinha cortado
na borda do PNG, recebe uma extensão atrás da camada principal, reaproveitando
o coquinho direito espelhado da mesma imagem. Uma margem transparente de 16 px
acomoda o contorno sem deslocar o rosto, a âncora ou as peças do corpo.
A seleção de pele foi calibrada para essas imagens e precisa de revisão se novas
artes ou tons forem adicionados. Bia, Pedrinho e Marta conservam os recortes anteriores.

Comparação dos seis cabelos: [aceno e pose frontal](screenshots/correcao-recortes.png).
A primeira linha mostra aceno; a segunda mostra a pose usada nos brinquedos.
Também foram conferidos [WebGL](screenshots/correcao-recortes-webgl.png) e o
[balanço no celular](screenshots/correcao-balanco-mobile.png).
Essas transformações ainda não equivalem a poses sentadas desenhadas de lado.

## Cidade e interiores ilustrados (etapa 05)

As referências enviadas pelo responsável definem o nível de acabamento: bairro
panorâmico em vista elevada, fachadas distintas, ruas, jardins e muitos detalhes.
As artes foram geradas para o universo da Laura, sem reproduzir mapas, personagens,
logos ou edifícios das referências. O parque existente e os seis avatares permanecem
com suas artes aprovadas. Textos e controles são desenhados pelo jogo.

| Asset | Uso |
|---|---|
| `assets/cenarios/cidade-ilustrada.webp` | Bairro com Parque, Padaria, Pet Shop e Casa da Laura |
| `assets/cenarios/padaria.webp` | Interior com balcão, pães, forno e prateleiras |
| `assets/cenarios/pet-shop.webp` | Interior com cama, potinhos e acessórios |
| `assets/cenarios/casa-laura.webp` | Quarto lilás ilustrado; função Em breve |
| `assets/personagens/npcs/dona-rosa.png` | Padeira independente, com transparência |
| `assets/personagens/npcs/bolinha.png` | Filhote independente, com transparência |

Os fundos usam WebP com qualidade 86, na resolução original, somando cerca de
1,2 MB. Os personagens conservam PNG e transparência. Os arquivos originais da
geração foram preservados no ambiente; nenhuma imagem foi baixada de outro jogo.
Todos os assets usados no jogo estão centralizados em `src/config/assets.ts`.

`public/assets/mapas/cidade.tmj` continua como mapa Tiled 40x30 de células 32x24
(mundo 1280x720), carregado por `load.tilemapTiledJSON`. Sua camada de objetos
Portas define as áreas de toque, `cena` e os destinos `entradaX`/`entradaY`. A
camada de chão técnico e `cidade-tiles.svg` ficam ocultos sob a ilustração; os
polígonos de colisão de mobiliário ainda não fazem parte deste mapa.

Os quatro fundos ocupam o mundo 1280x720. Dona Rosa tem altura de referência
280 px e é recortada abaixo do avental para ficar atrás da borda do balcão;
a cabeça e o chapéu ficam inteiros. Bolinha tem altura de referência 145 px e um
movimento suave sobre a cama. Os avatares continuam usando o rig corrigido.

Capturas atualizadas em [screenshots/cidade](screenshots/cidade/README.md).

## Interações por dados (etapa 06)

Assets que faltam para substituir os placeholders:

- [ ] Banco independente com dois lugares, PNG transparente, largura de mundo 170 px.
- [ ] Sorvete inteiro e com uma/duas mordidas, PNGs transparentes, largura 36 px.
- [ ] Bebedouro desligado/ligado, PNG transparente, largura 70 px.
- [ ] Poses segurando, comendo, deitada e dormindo para os seis cabelos; poses de lado sentadas continuam pendentes acima.
- [ ] Sons suaves de água, mastigar e abrir/fechar a mochila; áudio é opcional nesta etapa.

Até essa entrega, `ObjetoInterativo.garantirTexturas` gera seis texturas em
Graphics, centralizadas em `TEXTURAS_INTERACAO` no catálogo de assets. Banco,
sorvete e bebedouro usam origem (0,5; 1), com posições, áreas e snaps definidos
em `public/assets/dados/`. Mochila usa ícone SVG desenhado no próprio botão.
As partículas também são formas desenhadas; não há imagens externas novas.

O ponto provisório `mao` nos PNGs frontais é **(0,27 × largura, 0,70 × altura)**,
medido a partir do canto superior esquerdo da textura usada pelo avatar. A origem
dos pés e a transformação de rotação/espelhamento são descontadas no adaptador
`Avatar.mao()`. Vale para os seis cabelos e suas margens transparentes do rig;
novas poses devem fornecer seus próprios pontos. O item fica em profundidade
`avatar.depth + 1`. O banco usa a articulação existente, sem cortar novamente o
PNG e sem alterar as pernas ou o cabelo aprovados.

Capturas: [interações no parque](screenshots/interacoes/README.md).

## Casa com seis cômodos (etapa 07)

### Assets que faltam para a casa

- [ ] Fundos sem mobiliário de sala, cozinha, quarto, banheiro, quintal e lavanderia, 1280x720.
- [ ] Móveis separados do catálogo `casa-objetos.json`, com estados aberto/fechado e ligado/desligado.
- [ ] Cama e banheira com cobertor/água em camadas, porta fosca do box e tela de privacidade do sanitário.
- [ ] Roupas em camadas e itens de mão: livro, controle, quebra-cabeça, brinquedos, sementes, alimentos, utensílios e higiene.
- [ ] Quadros de alimento preparado, roupa limpa, flores em três estágios e patinho da banheira.
- [ ] Animações definitivas de sentar, deitar, tomar banho, comer e dançar, preservando os seis cabelos.
- [ ] Sons suaves de TV, rádio, cozinha, água, descarga, máquina e descobertas.

Todos esses elementos usam placeholders Graphics lilases com rótulos legíveis.
Não foram baixadas imagens. As chaves geradas ficam em `TEXTURAS_CASA`, no
catálogo central de assets. Os móveis têm origem (0,5; 1); as posições, larguras,
zonas e snaps vêm dos JSONs. O balanço reutiliza estrutura e assento aprovados;
a Vovó acompanha o ferro com o PNG existente. O fundo ilustrado antigo da casa
continua preservado, mas não serve de base aos móveis separados porque já traz
mobiliário desenhado na imagem.

Laura e as amigas usam o rig aprovado, sem novo recorte de cabelo ou pernas.
O sono usa giro de 90 graus e cobertura provisória; banho mantém o avatar vestido
com vidro translúcido. Esses movimentos são provisórios até receber as poses
indicadas acima. A mão usa o mesmo ponto normalizado da etapa 06, com item em
profundidade do avatar +1. Estrelas, moeda, patinho, notas e flores são desenhados.

Capturas dos seis ambientes: [casa](screenshots/casa/README.md).

## Celular e ícones de navegação (09, Etapa 1)

O celular lilás com estrela e os cinco apps são desenhos SVG próprios em
`src/ui/Icones.ts`: Personagens, Mapa, Amigos, Moedas e Sair. Há seta, confirmação,
cancelamento, mochila e ícones de utilidades. Nenhum asset foi baixado ou copiado.
Os SVGs decorativos têm `aria-hidden`; nomes acessíveis ficam nos botões, sem
rótulos visuais. Os alvos novos têm pelo menos 64x64 pixels do viewport.

Assets que faltam para refinar os atalhos secundários:

- [x] Pictogramas próprios de balanço, escorregador, gangorra, carrossel, areia,
  sorvete, banco e dos seis cômodos, desenhados em SVG lilás.
- [ ] Pictogramas exclusivos dos demais objetos; enquanto faltam, usam desenhos
  provisórios de caixa, mão e água, sem rótulos visuais.
- [ ] Retratos adicionais do futuro app Personagens. A Etapa 1 conserva o criador
  e as seis miniaturas aprovadas, sem implementar arrastar retratos ou categorias.

Nomes de móveis/portas só são desenhados no modo de desenvolvimento. O modo
publicado não mostra esses rótulos. Missões e instruções privadas do responsável
mantêm seus textos; não são cabeçalho nem rodapé do mundo.
