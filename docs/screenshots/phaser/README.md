# Capturas da revisão do port

Palco de 1280x720, cabelo Cacheado na missão.

| Arquivo | Estado verificado |
|---|---|
| `1-criador.png` | Seis closes, Cacheado selecionado, fundo desfocado em WebGL |
| `2-escolha.png` | Rosto da Laura e opções A/B/C |
| `3-conselho.png` | Rosto da Dona Marta, conselho A e tentativa novamente |
| `4-confete.png` | Entrega do carrinho, confete e dança |
| `5-balanco.png` | Arrasto até o balanço e oscilação |
| `6-gangorra.png` | Laura na ponta esquerda |
| `7-carrossel.png` | Órbita em torno do eixo |
| `8-escorregador.png` | Trajeto do escorregador |

O teste `npm run test:e2e` renova as oito capturas usando Canvas, que dispensa GPU
no CI. Nesta revisão, as capturas do criador e do confete foram substituídas por capturas WebGL feitas com
`npm run dev`, em `/avatar-laura/`, após comparar o protótipo aberto no navegador.
Os testes também verificam os dois conselhos, retorno ao criador, repetição da
missão sem nova recompensa, duas descidas e os tamanhos 390x844 e 844x390.

Favicon SVG revisado em 16 e 32 px: silhueta branca sobre lilás com detalhe dourado;
nenhuma alteração necessária. Limitações de poses e assets continuam em `docs/ARTE.md`.
