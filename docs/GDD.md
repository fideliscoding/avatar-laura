# GDD - My Town, My World (Minha Cidade, Meu Mundo)

## 1. Visão

Um mundo pequeno e acolhedor onde a Laura cria o próprio visual, passeia por lugares da cidade e ajuda pessoas. Cada lugar tem missões curtas que ensinam um valor do dia a dia por meio de uma escolha. O jogo nunca pune: escolhas que não ajudam recebem um conselho gentil e a chance de tentar de novo.

- Público: Laura, 9 anos (e amigas/amigos no futuro). Leitura simples, frases curtas, botões grandes.
- Plataforma: navegador (celular, tablet, computador). Mundo lógico 1280x720 com câmera que acompanha a Laura. Interface adaptativa em pixels visíveis (Scale.RESIZE).
- Tom: carinhoso, colorido, sem pressa, sem tempo-limite, sem derrota.
- Estilo: chibi profissional, paleta lilás, fonte Fredoka, sem emojis.

## 2. Valores ensinados

Valores e virtudes do cotidiano, não só religiosos:

| Valor | Exemplo de missão |
|---|---|
| Honestidade e empatia | Devolver o carrinho do Pedrinho (pronta) |
| Gentileza | Ajudar a Dona Marta a carregar as compras |
| Paciência | Esperar a vez no escorregador |
| Responsabilidade | Cuidar de um pet adotado (alimentar, passear) |
| Cuidado com o mundo | Recolher lixo do parque e separar recicláveis |
| Gratidão | Agradecer quem ajudou (frases prontas) |
| Coragem | Defender uma amiga com respeito |
| Perdão | Fazer as pazes depois de uma briga |
| Respeito | Respeitar a fila e o espaço dos outros |
| Partilha | Dividir o lanche com quem esqueceu o seu |

## 3. Telas e fluxo

```
Boot (carregando, barra lilás)
  -> Entrar (somente quando o Supabase está configurado; conta do adulto ou offline)
  -> Criador "Crie o seu visual"
       -> botão "Ir para o parque" -> Parque
  Parque -> botão "Trocar cabelo" -> Criador
  (futuro) Parque -> mapa da cidade -> outros lugares (casa, escola, padaria, pet shop)
```

### 3.1 Boot
Título "My Town, My World", barra de progresso lilás. Carrega a fonte Fredoka e todas as imagens de `src/config/assets.ts`. Gera texturas de partículas (confete e poeira).

### 3.2 Criador ("Crie o seu visual")
- Fundo: cenário do parque desfocado com véu lilás.
- Título branco com sombra roxa; subtítulo em pílula branca.
- Laura grande à esquerda (até 320x520, pés em y=640) sobre sombra oval; respiração leve e pulinho de 8% ao trocar.
- Painel branco à direita (560x520) com grade 3x2 de cabelos: miniatura em close da cabeça + nome. Selecionado com borda roxa.
- Cabelos: Liso, Rabo de cavalo, Tranças, Cacheado, Coque, Coquinhos.
- Botão "Ir para o parque".
- A escolha é salva.

### 3.3 Parque
- HUD: botão "Trocar cabelo" (topo esquerdo), caixa de objetivo ao lado, contador de moedas (topo direito, moeda dourada com estrela).
- Mover: tocar no chão (anel branco no ponto tocado) faz a Laura andar até lá (230 px/s). Arrastar a Laura e soltar perto de um brinquedo (até 120 px) a coloca nele.
- Tocar em um objeto faz a Laura andar até o ponto de parada dele e interagir.
- Profundidade por `y` (quem está mais embaixo fica na frente).

Interações:

| Objeto | Ação |
|---|---|
| Balanço | Balança até 28 graus, aumentando em 1,5 s |
| Escorregador | Sobe a escada e desce, duas vezes, depois sai pela frente |
| Gangorra | Sobe e desce 11 graus, Laura na ponta esquerda |
| Carrossel | Gira em volta do eixo, escala 0,78 |
| Carrinho de sorvete | Laura diz "Hmm, sorvete de morango!" |
| Dona Marta | Diz "Que menina gentil!". Acena a cada 5 s e diz "Oi, Laura!" a cada 10 s |
| Bia | Passeia entre o balanço e o escorregador, dizendo "Vou no escorregador!" e "Agora o balanço!" |
| Caixa de areia | Parte da missão do Pedrinho; depois diz "Que areia fofinha!" |
| Pedrinho | Inicia/encerra a missão; balão "!" enquanto precisa de ajuda |

## 4. Missão do Pedrinho: "O carrinho do Pedrinho"

Valor: **honestidade e empatia**. Código: `src/game/missaoPedrinho.ts`. Testes: `tests/missaoPedrinho.test.ts`. ID no banco: `pedrinho-carrinho`.

| Etapa | O que acontece | Texto exato |
|---|---|---|
| inicio | Objetivo no HUD | "Toque no chão para andar. Ajude quem precisa!" |
| inicio | Tocar no Pedrinho (triste, balão "!") | Pedrinho: "Perdi meu carrinho azul..." / botão "Eu te ajudo a procurar!" |
| procurando | Objetivo muda, aparece anel pulsante na areia | "Procure o carrinho azul do Pedrinho. Será que está na areia?" |
| procurando | Tocar na areia: poeira, carrinho azul pula da areia | - |
| escolhendo | Diálogo com o rosto da Laura | "Achei um carrinho azul na areia! O que você vai fazer?" |

Opções:

- **A) Guardar pra mim** -> Dona Marta: "Hmm... o Pedrinho está tristinho procurando o carrinho dele. Como será que ele se sente sem o brinquedo favorito?" -> botão "Tentar de novo" (volta para a escolha). 0 moedas.
- **B) Devolver ao Pedrinho** (botão rosa, destacado) -> Laura anda até o Pedrinho, o carrinho voa até ele, Pedrinho fica feliz e pula, **confete (180 peças)**, **+15 moedas** (contando de 1 em 1 a cada 70 ms com "pop" no contador), Laura dança (pulos e giro), Pedrinho diz "Meu carrinho! Obrigado!", objetivo vira "Missão completa! Você devolveu o carrinho. +15 moedas". Depois de 2,7 s: Pedrinho: "Obrigado, Laura! Você é uma amiga de verdade!" com botões "De nada!" e "Jogar a missão de novo".
- **C) Deixar ali** -> Dona Marta: "Se o carrinho ficar na areia, o Pedrinho pode nunca encontrar. Será que tem um jeito de ajudar?" -> "Tentar de novo". 0 moedas.

Depois de concluída: tocar no Pedrinho mostra "Obrigado de novo, Laura! Vamos brincar no escorregador?" (botão "Vamos!"). A recompensa só é paga uma vez; "Jogar a missão de novo" reinicia a história, mas no servidor (etapa 03) a função `concluir_missao` não paga de novo.

## 5. Economia

- Moedas: ganhas só em missões. Primeira missão: 15.
- Uso futuro: roupas, acessórios, móveis da casa, itens do pet. Sem dinheiro real, nunca.
- Missões da vida real (futuro): a criança marca "Arrumei a cama"; o responsável confirma no painel; só então as moedas entram (`requer_confirmacao_responsavel`).

## 6. Personagens

| Nome | Papel | Arquivos |
|---|---|---|
| Laura | Protagonista, 6 cabelos | `laura-frente-*.png`, `laura-lado-liso.png` |
| Pedrinho | Menino que perdeu o carrinho | `pedro-triste.png`, `pedro-feliz.png` |
| Bia | Amiga que brinca no parque | `bia.png` |
| Dona Marta | Vovó gentil que dá conselhos | `vovo.png` |

## 7. Segurança infantil

Ver `AGENTS.md`. Resumo: sem chat livre (frases prontas), sem dados pessoais, conta do responsável, amigos só por convite aprovado, sem anúncios nem compras, sem punição.

## 8. Limitações conhecidas (v0.1)

- Sem poses sentadas (Laura não senta no banco nem no carrossel de verdade).
- Vista de lado só existe com cabelo liso; os outros cabelos andam de frente espelhados.
- Sem som e sem música.
- Gangorra feita dividindo uma única imagem em base e tábua (recorte).
- Aceno da Dona Marta é só uma leve rotação da imagem inteira.

## 9. Ideias para versões futuras

- **Família:** avatares dos pais vinculados à conta da criança.
- **Alertas por e-mail aos pais:** missão concluída, pedido de amizade, resumo semanal.
- **Pais confirmam missões da vida real** antes de liberar moedas.
- **Pets adotados como missão** (responsabilidade: alimentar, dar banho, passear).
- **Muitas opções para criar:** lugares, personagens, missões e itens (editor simples com Tiled e JSON).
- **Multiplayer com amigos:** ver e brincar com amigos aprovados no mesmo parque, com frases prontas.

## 10. Mobile first e movimentos (etapa 03A)

O mundo conserva as coordenadas aprovadas do protótipo. A apresentação passa a usar
`Scale.RESIZE`: o canvas ocupa a área visual do navegador, desconta áreas seguras
e se adapta à abertura do teclado. A interface não é reduzida junto com o cenário.

- **Parque:** câmera com limites acompanha a Laura; zoom mínimo de 0,65 mantém
  personagens legíveis. Cabeçalho e atalhos ficam em `CenaInterface`, fora da câmera.
  No rodapé, os destinos são paginados com botões de pelo menos 44 px; todos os
  brinquedos, Pedrinho, areia e Dona Marta são alcançáveis sem depender de estarem
  no enquadramento inicial. O toque e o arrasto são convertidos para o mundo.
- **Missão:** rosto, fala e opções se reorganizam ao girar o aparelho. Em retrato,
  as respostas ficam empilhadas. Rotação preserva diálogo, estado e recompensa.
- **Criador:** avatar, grade de seis cabelos e botão do parque se reorganizam em
  retrato e paisagem. A escolha persiste, inclusive durante a rotação.
- **Conta:** campos com fonte de 16 px e altura mínima de 44 px. Com teclado ou
  pouca altura, o formulário permite rolagem interna e mantém as ações acessíveis,
  sem apagar os valores preenchidos.
- **Avatares:** braços, pernas e cabeça são articulados com recortes dos PNGs
  aprovados: passos alternados, respiração, aceno, dança e pernas dobradas nos
  brinquedos. Os seis cabelos usam a mesma lógica. Bia caminha com passos, Dona
  Marta move o braço no aceno e Pedrinho comemora brevemente ao receber o carrinho.

Essa articulação procedural não cria novas vistas de lado nem folhas desenhadas
quadro a quadro. Essas artes continuam listadas em `docs/ARTE.md`; o jogo já possui
movimento independente dos membros enquanto elas não existem.
