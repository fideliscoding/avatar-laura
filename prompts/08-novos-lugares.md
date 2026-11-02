# Etapa 08: novos lugares com interiores e missões de virtudes

Pré-requisitos: etapas 05 (mapa e missões por dados), 06 e 07. Leia `AGENTS.md`, `docs/GDD.md` e `docs/CASA-E-LUGARES.md`.

## Objetivo
Adicionar escola (sala de aula + pátio), padaria/mercado, clínica, salão de beleza, estúdio de dança, centro comunitário e pet shop com adoção, usando `CenaComodo` e o sistema de missões por dados.

## Etapas (um lugar por PR)
1. Mapa: fachadas clicáveis, caminhar até a porta, fade, interior; botão casa e botão mapa.
2. Escola: carteiras (assento), lousa (desenhar com 4 cores), bebedouro (fila). Missões: empatia (colega nova), honestidade (estojo achado), paciência (fila).
3. Padaria/mercado: cesta como recipiente, lista de compras, caixa com troco. Missões: honestidade (troco a mais), responsabilidade, gratidão.
4. Clínica: maca (cama), curativo (pegável aplicado no NPC). Missões: cuidado, coragem.
5. Salão e estúdio: cadeiras com espelho, rádio que faz dançar. Missões: respeito, perdão, coragem.
6. Centro comunitário: caixas de doação (recipiente que conta itens). Missões: gentileza, gratidão.
7. Pet shop: adotar 1 pet (escolha entre 3), pet segue entre cômodos e lugares, rotina de água/comida/passeio sem punição. Missão: responsabilidade. Pet salvo no Supabase.

## Critérios de aceite
- Cada lugar tem pelo menos 5 objetos interativos e 1 missão de virtude concluível com escolha gentil (errar só mostra conselho).
- Textos em constantes, pt-BR, sem emojis; nomes próprios nossos (não usar nomes do Avatar World).
- Funciona no multiplayer de convite; testes das missões em `src/game/`.
- Faltas de arte em `docs/ARTE.md`; prints no PR.
