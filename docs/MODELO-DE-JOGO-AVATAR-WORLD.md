# Modelo de jogo: o que aprendemos com o Avatar World

Documento de referência para o **My Town, My World: Friends Together** (Phaser 3 + Vite + TypeScript + Supabase, chibi lilás, sem emojis, valores e virtudes, para a Laura de 9 anos, multiplayer por convite).

Regra de ouro: **inspirar-se sem copiar**. Usamos as ideias de interação (toque, arrastar, encaixar, surpresa), mas personagens, arte, nomes, lugares e textos são nossos. **Não há monetização**: nada de passe, loja paga, anúncio ou moeda comprada. As moedas do jogo são só de faz de conta e ganhas brincando.

## Vídeos analisados

| Código | Título | Link |
|---|---|---|
| V1 | Playing Avatar World for the first time | https://youtu.be/QaFEHD4N07M |
| V2 | No Class Rainy Day Routine | https://youtu.be/151sn3YfD8Y |
| VC | Character Tutorial | https://youtu.be/6jRq7OGSHSo |
| VH | ALL CHECK-UP SECRETS (hospital) | https://youtu.be/WgI7bc9_jTE |
| VL | School Supplies Shopping | https://youtu.be/M7iObZteUGs |
| VM | NEW AVATAR WORLD CITY OF PAZU map update | https://youtu.be/LPgaoqiT7KQ |

A minutagem está no formato m:ss. Para abrir no ponto exato, acrescente `?t=<segundos>` ao link (ex.: 5:49 = `https://youtu.be/151sn3YfD8Y?t=349`).

---

## 1. Interface: nada fixo na tela

**Observado**
- Durante o jogo não existe HUD fixa. Só há um ícone de celular no canto, que abre os apps (criador, câmera). V2 5:49.
- A interface não tem texto, só ícones. VH, ao longo do vídeo.
- Os menus entram quicando e as caixas tremem antes de abrir. VH.
- A seta Voltar fica no canto superior esquerdo. VM 1:34.

**Como aplicar no nosso jogo**
- Remover a barra de botões inferior e os botões "Trocar cabelo", "Amigos" e "Sair".
- Um único **ícone de celular** (nosso desenho: celular lilás com capinha de estrela) no canto superior direito. Ao tocar, o celular sobe quicando e mostra 5 apps desenhados: **Personagens**, **Mapa**, **Amigos**, **Moedas**, **Sair**.
- Seta Voltar no canto superior esquerdo, só quando há para onde voltar (interior para mapa, app para tela inicial do celular).
- Nenhum texto na interface do jogo. Textos só nos balões de fala das missões, que a Laura já lê bem.

## 2. Tocar alterna estados

**Observado**
- Cafeteira solta vapor ao tocar. V1 0:44.
- Guarda-roupa abre. V2 2:24.
- Tocar na pizza do cardápio cria uma pizza. V2 3:48.
- Geladeira abre (V2 0:36), máquina de lavar (V1 2:53), gaveta (V2 2:50).
- A geladeira tem uma tela com calendário. VL 0:41.

**Como aplicar**
- Todo objeto interativo tem uma lista de estados e o toque passa ao próximo (aberto/fechado, ligado/desligado, aceso/apagado), com som curto e pequeno quique.
- "Geradores": tocar no cardápio da padaria, no pote de frutas ou na estante cria um item novo pegável (com limite por cômodo para não travar).
- Nossa geladeira pode ter um quadro de recados com o dia da semana (desenho próprio, sem copiar a tela do original).

## 3. Arrastar personagens, sem andar por toque

**Observado**
- Personagens são levados pelo ar com o dedo, não andam por toque. V2 0:43.
- Os personagens não andam sozinhos. VH.
- Rig recortado com squash e stretch. VH.

**Como aplicar**
- Pegar o personagem com o dedo: ele estica um pouco para cima (stretch), balança as pernas no ar e, ao soltar, cai com squash e um quiquezinho.
- Se soltar no meio do nada, cai até o chão do cômodo (sem dano, sem susto).
- No multiplayer, cada criança arrasta só os seus personagens; a posição é sincronizada ao soltar.

## 4. Zonas de encaixe generosas

**Observado**
- Escada: senta. V1 1:32.
- Sofá ou cama: dorme de olhos fechados. V2 1:30 e 1:39.
- Chuveiro: fica de toalha. V1 3:08, V2 1:50.
- Óculos no rosto (VH 1:45); cama de cirurgia em que deita dormindo (VH 1:59).

**Como aplicar**
- Cada móvel tem uma zona de encaixe bem maior que o desenho (raio de cerca de 80 px). Ao passar perto, a zona brilha levemente; ao soltar, o personagem encaixa com animação.
- Encaixes iniciais: assento (cadeira, banco, escada, balanço) → pose sentada; cama e sofá → pose deitada com rosto dormindo e "zzz" desenhado; chuveiro → pose de toalha com bolhas; brinquedos do parque (balanço, escorregador, gangorra) → pose e movimento próprios.
- Chuveiro: nossa versão mostra o personagem atrás de um box fosco e sai de toalha enrolada, adequado para a idade.

## 5. Itens na mão e comer

**Observado**
- Item perto da mão encaixa: guarda-chuva (V1 1:01), gato (V2 1:16), caneca (V2 3:32).
- Comer: levar à boca ou tocar quando está na mão, com migalhas. V1 4:11, V2 3:34.
- Celular na mão tem poses de selfie. V2 2:59.

**Como aplicar**
- Soltar um item perto da mão: ele encaixa no ponto `mao` do sprite e o personagem passa à pose segurando.
- Levar comida até a boca (ou tocar nela quando está na mão): come em **3 mordidas**, o desenho do item vai diminuindo, saem migalhas, e o rosto fica feliz.
- Pets também podem ser segurados no colo.

## 6. Colisão entre objetos gera efeito

**Observado**
- Lenha arrastada para a lareira acende o fogo. V2 2:44.
- Bolsa de gelo no galo faz o galo sumir e o rosto sorrir. VH 0:58.

**Como aplicar**
- Tabela de combinações por dados: `item + alvo → efeito`. Exemplos nossos: lenha + lareira = fogo; regador + planta = flor; curativo + joelho ralado = sorriso; sabão + prato sujo = prato limpo; ração + pote = pet feliz.
- Combinações viram ganchos para virtudes (cuidar da planta = responsabilidade, curativo no amigo = cuidado).

## 7. Expressões e emoções

**Observado**
- Tocar no personagem abre uma barra flutuante de emoções. V2 0:52.
- Doentes: rosto vermelho e olhos em espiral; o tratamento deixa feliz. VH 3:32.
- Prévia com respiração e piscada. VC 0:15.

**Como aplicar**
- Rosto em camada separada, com expressões por contexto: dormindo (na cama), doente (na clínica), feliz (comendo, ganhando presente), triste (missão com escolha não gentil, só por instante), surpresa (abrindo caixa).
- Tocar no personagem abre uma barrinha com 5 ícones desenhados (feliz, triste, surpresa, bravo de leve, sono). Sem emoji: são nossos desenhos vetoriais ou PNG.
- No multiplayer, a emoção escolhida aparece para o amigo também.
- Respiração (escala leve 1,0 a 1,02) e piscada aleatória a cada 3 a 6 s.

## 8. Cena larga, sem portas

**Observado**
- Cômodos formam uma faixa larga arrastável, sem portas. V1 2:45 a 2:55.
- Na mansão, para os lados troca cômodo e para cima ou para baixo troca de andar. VL 4:28.
- Vista de diorama rasa. V1, V2.

**Como aplicar**
- A casa vira uma cena única larga (ex.: 4 cômodos x 1280 px) com câmera arrastável na horizontal e, quando houver, andares empilhados na vertical. A câmera para com suavidade nas bordas e encaixa no cômodo mais próximo.
- Arrastar no fundo move a câmera; arrastar num objeto ou personagem move o objeto. Levar um personagem até a borda da tela rola a câmera junto.

## 9. Mapa isométrico

**Observado**
- Mapa isométrico arrastável em qualquer direção. V2 0:10 a 0:25, VM 0:33.
- Tocar no prédio entra. VM 1:52.
- Balão NEW amarelo e preto pulsante. VM 0:49.
- Carros, ônibus e patinetes de enfeite. VM 0:54.
- Tocar no sol leva ao pôr do sol e depois à noite. VM 1:16 a 1:23.

**Como aplicar**
- Mapa isométrico da nossa cidade (casa, escola, padaria, clínica, salão, estúdio, centro comunitário, pet shop, parque), arrastável com limite nas bordas.
- Tocar no prédio: ele quica e a cena entra com fade.
- Selo **NOVO** nosso (estrela lilás e rosa, sem texto, pulsando) em lugares ainda não visitados.
- Carrinhos, ônibus e bicicletas andando em caminhos fixos, só de enfeite.
- Sol no céu: tocar alterna manhã → tarde → pôr do sol → noite (tinta da cena e janelas acesas).

## 10. Criador de personagem

**Observado**
- Prévia à esquerda num pedestal, botão de girar, painel à direita. VC 0:01.
- Ícones de categoria no topo (corpo, cabelo, rosto, roupa, acessórios), subabas verticais, grade 3x4 de miniaturas. VC 0:02.
- Faixa vertical de cores ao lado da grade. VC 0:13.
- Prévia instantânea. VC 0:15.
- Salva ao sair; pelo celular, arrasta-se o retrato para a cena e o personagem cai quicando. VC 4:02 a 4:08.

**Como aplicar**
- App Personagens no celular: lista de retratos dos nossos personagens (Laura, Bia, Pedrinho e os criados). Arrastar um retrato para fora do celular solta o personagem na cena, quicando.
- Criador: prévia ao vivo à esquerda em pedestal lilás, girar (frente/costas), categorias por ícone no topo, grade de miniaturas 3x4 e faixa vertical de cores. Salva automaticamente no Supabase ao sair.

## 11. Segredos escondidos

**Observado (hospital)**
- Painel atrás da cafeteira (VH 0:27), estrela na parede que desliza (2:15), portinhola do hamster (2:33), pôster que esconde um cofre (2:56), painel no depósito (3:12).

**Como aplicar**
- Cada cômodo tem 1 a 3 segredos nossos: quadro que vira e mostra um bilhete de gentileza, tijolo solto com uma chave, toca de rato no rodapé, estrela no teto.
- Achar um segredo dá confete e um adesivo para o álbum (sem valor de compra). O progresso dos segredos é salvo.

## 12. Surpresa: caixas e sacolas

**Observado**
- Caixas tremem antes de abrir. VH.
- No caixa, contador de itens sobe de 3 a 20; paga-se com notas. VL 2:47 a 3:16.
- Sacolas no chão e depois em casa; tocar faz itens saltarem e se arrumarem na cama. VL 3:34 a 3:39.
- Tocar no item faz ele voar para a mochila aberta. VL 3:51.
- Caixas de presente com conjuntos de móveis. VL 2:59.
- Confete e estrelas ao concluir. VH 5:23.

**Como aplicar**
- Caixa surpresa: treme 2 vezes, abre com confete e solta 3 a 6 itens que pulam e caem no chão.
- Sacolas da padaria e da papelaria: tocar faz os itens saltarem para fora; tocar num item com a mochila aberta faz ele voar para dentro.
- Caixa registradora com notas de faz de conta (moedas ganhas brincando, sem compra real). Gancho de honestidade: troco a mais.

## 13. Decoração

**Observado**
- Tocar num móvel ou parede abre paleta de 5 cores. VL 2:07, 3:08.
- Sofás modulares se encaixam. VL 3:28.

**Como aplicar (fase posterior)**
- Paleta de 5 cores pastel ao manter o dedo num móvel ou parede. Peças modulares (sofá, estante) que se encaixam lado a lado. Fica para depois da etapa 09.

## 14. Arte

**Observado**
- Diorama 2D com leve isometria, pastéis saturados, contorno grosso nos interativos e fino no fundo, chibi de cabeça grande, rig recortado tipo Spine. VH.

**Como aplicar**
- Mantemos nosso chibi lilás (`#b58cf5`, `#8b55e6`, `#5a2fa8`, rosa `#f27ab3`).
- Contorno grosso (4 a 6 px, `#5a2fa8`) nos objetos interativos e fino ou nenhum no fundo: a Laura sabe o que pode tocar só de olhar.
- Personagem em partes (corpo, cabeça, rosto, cabelo, braços) para trocar poses e expressões sem redesenhar tudo.

## 15. Regras de design

- **Sem derrota.** Nada de vida, tempo esgotado ou "perdeu". Errar numa missão só mostra um conselho gentil. VH.
- **Bagunça livre.** Soltar coisas em qualquer lugar; um gesto de "arrumar" pode existir, nunca punição.
- **Faz de conta livre, surpresa e personalização com um toque** são o núcleo da diversão.
- **Missões de virtudes continuam**, mas aparecem como balão no personagem (ex.: Pedrinho com balão de ícone de estojo perdido), sem painel nem lista na tela.
- **Multiplayer por convite e salvamento** são preservados.
- **Sem monetização.** O original tem AW Pass mensal (VL 6:50). Nós não teremos passe, assinatura, anúncios ou compras.

## Entrega 09.1

A Etapa 1 de `prompts/09-modelo-toque-sem-botoes.md` foi implementada em PR próprio:
celular com cinco apps, fechamento por fora/seta, saída confirmada por ícones,
atalhos antigos reunidos nos apps e remoção das barras fixas. Os nomes acessíveis
continuam em pt-BR; convites e salvamento usam as rotinas anteriores. Falas de
missões e a área do responsável permanecem legíveis. As Etapas 2–13 ainda aguardam
aprovação e não fazem parte desta entrega.
