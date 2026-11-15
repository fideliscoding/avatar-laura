# Padrão visual do My Town, My World

Este é o guia obrigatório para qualquer arte do jogo: personagem, roupa, cabelo, rosto, cenário, objeto, ícone ou UI. Ele é a base da REGRA DE OURO do `AGENTS.md`.

## 1. Estilo: chibi profissional
- **Proporções:** a cabeça tem cerca de 40 a 45% da altura total. O corpo é curto, as mãos são pequenas e arredondadas e os pés são curtos. Na pose frente, de 512 x 768, o topo da cabeça fica em y=96, os olhos em y≈260 e os pés em y=736.
- **Rosto:** olhos grandes, com cerca de 1/4 da largura da cabeça, íris escura com 1 ou 2 brilhos brancos e cílios curvos no canto externo. O nariz é um pequeno traço em "c". A boca é pequena, rosa por dentro e com dentes brancos quando aberta. As sobrancelhas são grossas e arredondadas. As bochechas levam um blush suave.
- **Traço e contorno:** linha marrom-escura e arroxeada, próxima de `#1A1424` a `#26182A`, nunca preta pura. A espessura fica em torno de 5 a 6 px no canvas de 512, mais fina nos detalhes internos (dobras e mechas) e com as pontas arredondadas. Toda peça tem contorno externo fechado.
- **Sombreamento:** cel shading suave, com 1 tom de sombra, 1 de luz e um brilho pequeno. A luz vem do alto à esquerda. Sem degradês fortes, texturas fotográficas ou sombras duras de alto contraste. O cabelo tem mechas definidas e uma faixa de brilho.
- **Cores:** tons pastel e limpos. A pele é quente e o cabelo tem cor própria aplicada por tint.
- **O que não é o estilo:** flat sem contorno, pixel art, 3D, foto, traço de rabisco, emoji, ícones de sistema, formas geométricas simples (círculos e retângulos como arte) e desenho programático (`Graphics`/CSS) como arte final.

## 2. Paleta lilás (UI e cenário)
| Uso | Cor |
|---|---|
| Lilás claro (fundos) | `#F6EFFF`, `#EFE6FF`, `#E2D3FB` |
| Lilás médio (botões, seleção) | `#C9A8F5`, `#B48DF0`, `#B58CF5` |
| Lilás forte (destaque, texto) | `#9B6FE0`, `#8B55E6`, `#6B3FC0` |
| Roxo escuro (texto, sombra de botão) | `#5A2FA8`, `#4B2D84` |
| Rosa de destaque | `#F27AB3`, `#FF9EC8`, `#F0507A` (botão de remover) |
| Contorno | `#1A1424` |

- UI: cartões brancos com cantos bem arredondados (22 a 36 px) e "sombra de botão" sólida embaixo, em lilás mais escuro. Fonte Fredoka (ou Nunito), em negrito.
- Item selecionado: aro lilás forte `#9B6FE0`. Para remover, um círculo rosa com "×" no canto do item.
- Ícones de categoria são **miniaturas das próprias peças** desenhadas, nunca emoji ou forma simples.

## 3. Especificação das camadas de personagem
- PNG RGBA de **512 x 768**, sem trim, com **origem em (256, 736)** (centro entre os pés, no chão). No Phaser: `setOrigin(0.5, 736/768)`.
- As âncoras e a ordem das camadas estão em `public/assets/personagens/camadas/frente/ancoras.json` e `docs/ARTE-CAMADAS.md`.
- **Pele e cabelo em cinza**, recebendo a cor por tint. Roupas e acessórios têm `{nome}.png` (cor original) e `{nome}-cinza.png` (cinza com sombra e contorno preservados) para a cor por peça.
- Tint por mapa de luz HSL, com referência de cinza pele 242, cabelo 232 e peças 235. A fórmula está em `docs/ARTE-CAMADAS.md`. Não use multiply puro, porque ele acinzenta as cores claras.
- Cabelo em duas partes: `cabelo-frente-*` (franja e couro cabeludo, dentro da cabeça) e `cabelo-tras-*` (volume e comprimento, atrás do corpo).
- Rosto montável: `olhos-*`, `boca-*` e `sobrancelha-*`, sem tint.
- Peça nova: edite o `corpo-base-gabarito.jpg` com o gerador ("mantenha tudo idêntico, só adicione X"), alinhe com ECC, extraia pela diferença e exporte no canvas fixo (`ferramentas/arte-camadas/`).

## 4. Imagens de referência aprovadas (`docs/referencias/`)
| Arquivo | O que mostra |
|---|---|
| `laura-referencia-estilo.jpg` | A Laura no estilo aprovado: proporção, traço e paleta |
| `corpo-base-gabarito.jpg` | O corpo base de onde partem todas as peças da pose frente |
| `laura-camadas-v1-aprovada.png` | A Laura montada em camadas (v1 aprovada) |
| `folha-todas-as-pecas.png` | Todas as camadas v2 |
| `folha-rostos.png` | Olhos, bocas, sobrancelhas e rostos feliz e triste |
| `folha-cabelo-frente-x-tras.png` | As 49 combinações de franja e cabelo de trás |
| `folha-paletas-pele-cabelo.png` | 12 tons de pele e 12 cores de cabelo |
| `folha-cor-por-peca.png` | Peças com troca de cor |
| `combinacoes-8.png` | 8 personagens montados |
| `ui-1-franja.png` | A interface do criador, com o padrão de UI lilás |

## 5. Checklist de aprovação (marque no PR)
- [ ] O traço, o contorno e o sombreamento são iguais aos de `docs/referencias/`, sem mistura de estilos.
- [ ] Não há emoji, forma geométrica simples, placeholder nem arte feita com `Graphics`/CSS.
- [ ] As proporções chibi estão certas: a cabeça grande bate com o gabarito.
- [ ] As cores estão dentro da paleta lilás, ou a peça usa tint com as paletas do `ancoras.json`.
- [ ] Camada de personagem: 512 x 768, RGBA, origem (256, 736), alinhada ao gabarito, sem fresta de pele e sem borda verde ou branca.
- [ ] Pele e cabelo estão em cinza. Peça colorizável tem as versões `{nome}.png` e `{nome}-cinza.png`.
- [ ] A peça combina com todas as outras: testada em pelo menos 3 tons de pele, 3 cores de cabelo e 2 cabelos.
- [ ] Nada foi copiado do Avatar World ou de outro jogo (assets, telas, layout).
- [ ] Há um screenshot da tela no jogo em `docs/screenshots/`, comparado lado a lado com as referências.
- [ ] Quando faltou arte, o pedido foi registrado em `docs/ARTE-NECESSARIA.md`.
