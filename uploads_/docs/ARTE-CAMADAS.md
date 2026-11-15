# Arte em camadas, v2 (pose frente)

Este documento substitui a versão anterior de `docs/ARTE-CAMADAS.md` para a pose **frente**. As outras poses continuam com a especificação antiga até serem produzidas no padrão v2.

## 1. Canvas e origem
- Toda camada é um PNG RGBA de **512 x 768**, sem corte (sem trim). A peça já fica desenhada no lugar certo e o resto é transparente.
- A origem fica em **(256, 736)**, no centro entre os pés, na linha do chão. No Phaser use `setOrigin(0.5, 736/768)`.
- As âncoras estão em `ancoras.json`: `olho_esq` (200,261), `olho_dir` (320,259), `topo_cabeca` (246,96), `cintura` (246,497) e `pes` (256,736).
- Pasta no repositório: `public/assets/personagens/camadas/frente/`.

## 2. Ordem das camadas (de trás para a frente)
| # | Camada | Arquivos | Tint |
|---|---|---|---|
| 1 | cabelo de trás | `cabelo-tras-{liso,coquinhos,cacheado,franjareta,rabo,trancas,ondulado}` | cabelo |
| 2 | pele | `corpo-pele` | pele |
| 3 | contorno do corpo (com camiseta e short brancos de base, orelhas e nariz) | `corpo-linhas` | não |
| 4 | olhos | `olhos-{padrao,estrela,coracao,alegre,pisca,surpresa,sono,confiante,triste}` | não |
| 5 | boca | `boca-{padrao,alegre,coracao,pisca,surpresa,sono,confiante,triste}` | não |
| 6 | sobrancelha | `sobrancelha-{padrao,alegre,surpresa,sono,confiante,triste}` | não |
| 7 | meias | `meias-listradas` | peça |
| 8 | parte de baixo | `roupa-baixo-{saia-roxa,calca-jeans,short-jeans}` | peça |
| 9 | parte de cima **ou** vestido | `roupa-cima-{lilas-estrela,listras-rosa}` / `vestido-rosa` | peça |
| 10 | calçado | `calcado-{tenis-branco,sapatilha-rosa}` | peça |
| 11 | colar | `acessorio-colar-coracao` | peça |
| 12 | casaco | `casaco-lilas` | peça |
| 13 | bolsa tiracolo | `acessorio-bolsa-rosa` | peça |
| 14 | brincos | `acessorio-brincos-{bolinha,estrela}` | peça |
| 15 | cabelo da frente (franja e couro cabeludo) | `cabelo-frente-{...}` (mesmos 7 ids) | cabelo |
| 16 | cabeça | `acessorio-tiara`, `acessorio-presilha-laura`, `acessorio-laco-rosa`, `acessorio-bone-lilas` | peça |
| 17 | óculos | `acessorio-oculos-vermelho` | peça |

Regras de combinação:
- O **vestido (conjunto)** substitui a blusa e a parte de baixo. Ao escolher blusa ou parte de baixo, o vestido sai.
- O boné não combina com tiara nem laço. Só um par de brincos por vez.
- Qualquer franja combina com qualquer cabelo de trás (são 7 x 7 combinações; veja `shots-v2/folha-cabelo-frente-x-tras.png`).
- O cabelo da frente cobre só o que está dentro da silhueta da cabeça (até o queixo). Comprimento, volume e tranças ficam no cabelo de trás, que é desenhado atrás do corpo. As orelhas sempre aparecem por cima do cabelo.
- Sem roupa (sem blusa, parte de baixo e vestido), o personagem fica com o rosto triste. A cada troca de peça ele faz o rosto feliz por 0,9 s e dá um pulinho.
- Rostos prontos para reação (em `ancoras.json` > `rostos`): `feliz` = olhos, boca e sobrancelha `alegre`; `triste` = os três `triste`.

## 3. Regras de tint
- **Pele, cabelo e a versão `-cinza` das peças** são em tons de cinza. Valor de referência do meio-tom: pele 242, cabelo 232 e peça 235 (em `ancoras.json` > `tint.ref`).
- Cada peça colorizável tem dois arquivos: `{nome}.png`, com a cor original aprovada, e `{nome}-cinza.png`, em cinza com as sombras e o contorno preservados. O contorno (cinza abaixo de 55) não muda.
- Fórmula, que é a mesma no `index.html` e em `pro/tint2.py`. Ela é um mapa de luz em HSL e substitui o multiply, que deixava os cabelos claros acinzentados:
  - `t = cinza / ref`
  - se `t <= 1`: `L = Lcor * t^1.05` e `S = min(1, Scor + ganho*(1-t))`, com ganho de 0,30 para cabelo e peças e 0 para a pele
  - se `t > 1`: `L = Lcor + (1-Lcor) * 0,75 * (t-1)/(1/ref-1)`
  - se `cinza < 0,24`, a cor se mistura com o contorno `#1A1424`, e as linhas continuam escuras
- Paletas, com 12 cores cada:
  - pele: `#FFE6D6 #FAD4BC #F3C3A0 #F39D6A (Laura) #E8A27A #D9A077 #C98A5E #B0744A #93603C #77492C #5C3822 #40261A`
  - cabelo: `#2B1B14 #5A3522 #8A5A35 #B5462E #D9A35B #F0D58C #FFF0B0 #E8E8F0 #B48DF0 #FF9EC8 #6FB7FF #7ED6B5`
  - peças: `#FFFFFF #C9A8F5 #9B6FE0 #6B3FC0 #FF9EC8 #F0507A #E83A3A #FFB35C #FFE070 #7ED6B5 #6FB7FF #2E3A6E`, mais a opção "cor original"
- Olhos, boca, sobrancelha e o contorno do corpo não recebem tint.
- No Phaser, `setTint` faz multiply. Para ter o mesmo resultado, gere texturas tingidas com um `CanvasTexture` usando a mesma fórmula, que pode ser uma LUT de 256 entradas por cor (como em `tingido()` no `index.html`), e guarde em cache por camada e cor.
- `getImageData` exige que a página seja servida por HTTP. Em `file://` o navegador bloqueia. No jogo (Vite) isso já funciona.

## 4. Como a arte foi produzida (para repetir em peças novas)
1. Parta de `gen/base.jpg`: o corpo base careca, de camiseta e short brancos, sobre fundo verde.
2. Edite com o gerador de imagem usando o pedido "mantenha tudo idêntico e só adicione/troque X" e o `base.jpg` como referência. Os prompts usados estão nos nomes dos arquivos `gen/e-*.jpg` (peças e cabelos) e `gen/f-*.jpg` (rostos).
3. Alinhe a edição ao corpo base com OpenCV ECC (afim), usando a máscara do rosto para peças de cabeça e a do corpo para roupas (`pro/lib.py: register`).
4. Extraia a peça pela diferença com o corpo base, separe a pele por "unmix" com a cor de pele estimada e remova o fundo verde por chroma (`pro/build_v2.py: generic`, `hair`, `feats`).
5. Leve para o canvas 512 x 768 com a mesma transformação do corpo (`to_canvas`).
6. Gere a versão cinza (`pro/cinza.py`) e confira na folha (`pro/shots_v2.py`).

Comandos: `cd pro && python3 build_v2.py && python3 cinza.py && python3 manifest.py && python3 shots_v2.py`.
