# Etapa 09: modelo de toque, sem botões

Pré-requisitos: etapas 01 a 08. Leia `AGENTS.md`, `docs/GDD.md`, `docs/INTERACOES.md`, `docs/CASA-E-LUGARES.md` e, principalmente, `docs/MODELO-DE-JOGO-AVATAR-WORLD.md` (referências com minutagem).

## Objetivo
Refazer a experiência do **My Town, My World: Friends Together** para ser jogada só com toque e arrastar, sem botões nem texto na interface, como um diorama de faz de conta. Inspirar-se no modelo descrito sem copiar: personagens, arte, nomes e textos são nossos. Sem monetização. Sem emojis.

## Regras gerais
- Phaser 3 + Vite + TypeScript + Supabase, como já está.
- Um PR por etapa abaixo, pequeno, com testes em `src/game/` para a lógica pura (estados, encaixes, combinações, mordidas, segredos).
- Interface **sem texto**: só ícones desenhados. Textos só nos balões de fala das missões, em constantes pt-BR.
- **Sem estado de derrota.**
- Se faltar arte, usar formas provisórias com `Graphics` (lilás, contorno grosso nos interativos), como manda o `AGENTS.md`, e registrar a falta em `docs/ARTE.md` ("Assets que faltam"). O rótulo com nome do objeto, se usado, só em modo de desenvolvimento (`import.meta.env.DEV`). Nunca baixar imagens da internet.
- Preservar o multiplayer por convite e o salvamento no Supabase em todas as etapas.
- Funcionar em toque (celular/tablet) e mouse. Alvos de toque com no mínimo 64 px.
- Não reformatar arquivos fora da tarefa.

## Etapas

### 1. Remover botões e criar o ícone de celular
- Remover a barra de botões inferior e os botões "Trocar cabelo", "Amigos" e "Sair" de todas as cenas.
- Criar `src/ui/Celular.ts`: ícone fixo no canto superior direito; ao tocar, o celular sobe quicando e mostra 5 apps em ícone: Personagens, Mapa, Amigos, Moedas, Sair. Tocar fora ou na seta fecha.
- Amigos reaproveita o fluxo atual de convite; Sair reaproveita o atual (com confirmação por ícones, sem texto).
- Aceite: nenhuma tela de jogo mostra botão com texto; todos os fluxos antigos são alcançáveis pelo celular.

### 2. Arrastar personagens com squash e stretch
- Personagem é pego com o dedo e levado pelo ar (não anda por toque). Ao pegar: stretch vertical e pernas balançando. Ao soltar: cai até o chão do cômodo com squash e quique.
- Respiração e piscada em repouso.
- Aceite: arrastar e soltar funciona com toque e mouse; no multiplayer, o amigo vê a nova posição; ninguém arrasta o personagem do outro.

### 3. Zonas de encaixe
- `src/game/encaixes.ts`: zonas por dados (tipo, raio generoso ~80 px, pose, rosto).
- Assento → sentada; cama/sofá → deitada com rosto dormindo; chuveiro → atrás do box fosco e sai de toalha; parque → balanço, escorregador e gangorra com movimento.
- A zona brilha quando o personagem passa perto.
- Aceite: soltar a até 80 px do móvel encaixa; o rosto muda ao dormir; testes cobrem a escolha da zona mais próxima.

### 4. Itens na mão e comer
- Soltar item perto da mão: encaixa no ponto `mao`, pose segurando.
- Comida até a boca, ou tocar com ela na mão: come em **3 mordidas** (item encolhe, migalhas, rosto feliz) e o item some.
- Aceite: teste da sequência de 3 mordidas; o item segurado acompanha o personagem quando ele é arrastado.

### 5. Tocar alterna estados
- Todo objeto interativo tem lista de estados; o toque passa ao próximo com som curto e quique (geladeira, guarda-roupa, gaveta, máquina de lavar, TV, abajur, cafeteira com vapor).
- Geradores: tocar no cardápio, fruteira ou estante cria um item pegável (limite por cômodo).
- Aceite: estados salvos e sincronizados no multiplayer; teste do ciclo de estados e do limite.

### 6. Colisão entre objetos
- `src/game/combinacoes.ts`: tabela `item + alvo → efeito` (lenha + lareira = fogo; regador + planta = flor; curativo + machucado = sorriso; sabão + prato sujo = limpo; ração + pote = pet feliz).
- Aceite: soltar o item sobre o alvo dispara o efeito com partículas; teste da tabela.

### 7. Expressões e barrinha de emoções
- Rosto em camada: feliz, triste, surpresa, dormindo, doente (vermelho, olhos em espiral), por contexto.
- Tocar (sem arrastar) no personagem abre uma barrinha flutuante com 5 ícones desenhados de emoção. Nada de emoji.
- Aceite: a emoção escolhida aparece por 3 s e é vista pelo amigo no multiplayer.

### 8. Cena larga com câmera arrastável
- A casa vira uma faixa larga de cômodos sem portas; arrastar no fundo move a câmera para os lados; andares empilhados na vertical (arrastar para cima e para baixo).
- A câmera encaixa suavemente no cômodo mais próximo e respeita as bordas. Levar um personagem até a borda rola a câmera.
- Aceite: distinguir arrastar fundo de arrastar objeto sem falhas; 60 fps num celular médio.

### 9. Mapa isométrico
- App Mapa abre o mapa isométrico da nossa cidade, arrastável em qualquer direção com limites.
- Tocar no prédio: quica e entra com fade. Selo NOVO nosso (estrela, sem texto) pulsando nos lugares não visitados.
- Carros, ônibus e bicicletas de enfeite em caminhos fixos.
- Sol: tocar alterna manhã, tarde, pôr do sol e noite (tinta e janelas acesas).
- Seta Voltar no canto superior esquerdo dentro dos interiores.
- Aceite: lugares visitados salvos no Supabase; o selo some após a primeira visita.

### 10. App Personagens e criador
- App Personagens: retratos dos personagens; arrastar um retrato para fora do celular solta o personagem na cena, caindo e quicando.
- Criador com prévia ao vivo à esquerda num pedestal com girar; categorias por ícone no topo (corpo, cabelo, rosto, roupa, acessórios); grade de miniaturas 3x4; faixa vertical de cores. Salva ao sair.
- Aceite: mudança aparece na prévia instantaneamente; personagem criado persiste e aparece para o amigo.

### 11. Segredos por cômodo
- 1 a 3 segredos por cômodo (quadro que vira, tijolo solto, toca no rodapé, estrela no teto), por dados.
- Achar dá confete e um adesivo no álbum (app Moedas mostra moedas e adesivos).
- Aceite: segredos achados salvos; teste do registro.

### 12. Caixas surpresa e sacolas
- Caixa surpresa treme 2 vezes, abre com confete e solta 3 a 6 itens que pulam.
- Sacolas: tocar faz os itens saltarem para fora; com mochila aberta, tocar no item faz ele voar para dentro.
- Moedas só de faz de conta, ganhas brincando. Nada de compra real, passe ou anúncio.
- Aceite: itens soltos viram pegáveis normais; inventário salvo.

### 13. Contorno e missões em balão
- Contorno grosso (4 a 6 px, `#5a2fa8`) em todo objeto interativo; fundo com contorno fino ou nenhum.
- Missões de virtudes continuam, mas aparecem como balão com ícone sobre o personagem que precisa de ajuda; tocar no balão abre a fala e as escolhas. Sem painel nem lista. Escolha não gentil só mostra conselho.
- Aceite: todas as missões das etapas 05 e 08 concluíveis por balão; nenhum painel de missões na tela.

## Critérios de aceite gerais
- Nenhum botão com texto nem HUD fixa além do ícone de celular (e da seta Voltar quando cabível).
- Sem estado de derrota em nenhum fluxo.
- Sem emojis em código, textos ou assets.
- Multiplayer por convite e salvamento funcionando como antes (testes existentes passam).
- `npm run build` e `npm test` sem erros.
- Formas provisórias onde faltar arte, com a falta registrada em `docs/ARTE.md`.
- Nomes, personagens e arte próprios; nada copiado do Avatar World.
