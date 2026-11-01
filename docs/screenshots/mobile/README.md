# Mobile first e movimento dos avatares

## Capturas

| Arquivo | Conferência |
|---|---|
| [Criador em retrato](1-criador-retrato.png) | Avatar, seis cabelos e botão do parque, 390x844 |
| [Parque em retrato](2-parque-retrato.png) | Câmera próxima e controles fora do mundo, 390x844 |
| [Conversa](3-dialogo-retrato.png) | Rosto e resposta legível |
| [Escolhas em retrato](4-escolhas-retrato.png) | A/B/C empilhadas e alvos grandes |
| [Escolhas em paisagem](5-escolhas-paisagem.png) | Painel reorganizado ao girar |
| [Paisagem pequena](6-missao-paisagem-pequena.png) | Rotação durante a missão, 567x298 |
| [Balanço](7-balanco-retrato.png) | Pernas articuladas e enquadramento do brinquedo |
| [Criador pequeno](8-criador-pequeno.png) | Grade utilizável em 298x567 |
| [Área de teclado](9-conta-area-teclado.png) | Formulário com rolagem interna, viewport 390x320 |
| [Conta no parque](10-conta-parque-pequeno.png) | Apelido, Sair e saldo em 298x567, API simulada |

## Movimento

[Assistir à gravação de passos, balanço e NPCs](movimentos.webm).
A gravação foi feita no jogo em execução, sem animação adicionada ao vídeo.
O movimento usa recortes articulados dos PNGs atuais, com os mesmos cabelos.
Folhas desenhadas de novas vistas e poses continuam pendentes em `docs/ARTE.md`.

## Evidências

- 25 testes Vitest, incluindo layout em cinco tamanhos e poses dos membros.
- Cinco testes de jogo: fluxo anterior, arrasto e brinquedos, retrato/paisagem,
  missão por toque, câmera, partes animadas e criador pequeno.
- Quatro testes de conta: cadastro e mensagens, orientações, área de teclado e
  parque autenticado pequeno. O servidor da suíte de contas é simulado, sem rede real.
- Navegação por atalhos permite alcançar destinos fora do primeiro enquadramento.
- Ao girar com a escolha aberta, o diálogo e a missão permanecem ativos e a entrega
  do carrinho salva exatamente 15 moedas. O teste anterior mantém a recompensa única.

Capturas e testes em Chromium/Canvas, com API de toque no fluxo mobile. A redução
pelo teclado é simulada por redução do viewport; o comportamento do teclado nativo,
as barras e a área segura ainda devem ser conferidos em aparelhos físicos Android
e iOS após a publicação. Não foi feita medição de FPS em aparelho físico.
