# Poses da Laura

Arquivos em `public/assets/laura/poses/`, nome `laura-<pose>-<cabelo>.png`.

Poses: sentada, segurando, toalha, ar, deitada. Rostos: rosto-feliz, rosto-triste, rosto-surpresa, rosto-dormindo, rosto-comendo.
Cabelos: liso, rabo, trancas, cacheado, coque, coquinhos.

## Escala e alinhamento
- Todas as poses de corpo estao na mesma escala: a pose de pe (segurando) tem 400 px de altura, a mesma faixa das laura-frente-*.png atuais (cerca de 385-406 px).
- Cada pose tem um canvas fixo, igual para os 6 cabelos. A figura fica centralizada na horizontal e com os pes (ou a base, na deitada) encostados na borda inferior. Ancore o sprite pelo centro inferior (origin 0.5, 1).
- Os rostos (canvas 220x255 px) estao na mesma escala da cabeca do corpo, base no canto inferior.
- A toalha usa touca que cobre todo o cabelo, por isso e a mesma arte para liso, trancas, cacheado, coque e coquinhos; o rabo tem versao propria.

## Ponto de ancora da mao (pose segurando)
Coordenadas em pixels a partir do canto superior esquerdo do PNG. E o centro da palma aberta da mao direita da Laura (lado esquerdo de quem olha). Coloque o centro inferior do item nesse ponto.

| cabelo | arquivo | tamanho | mao (x, y) |
|---|---|---|---|
| liso | laura-segurando-liso.png | 227x404 | (34, 183) |
| rabo | laura-segurando-rabo.png | 227x404 | (36, 192) |
| trancas | laura-segurando-trancas.png | 227x404 | (34, 186) |
| cacheado | laura-segurando-cacheado.png | 227x404 | (30, 187) |
| coque | laura-segurando-coque.png | 227x404 | (43, 196) |
| coquinhos | laura-segurando-coquinhos.png | 227x404 | (35, 192) |

Em unidades relativas (origin 0.5,1), a mao fica em torno de x = -71 a -84 px e y = -208 a -221 px (veja a tabela) a partir do ponto dos pes.
