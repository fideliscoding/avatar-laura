# Etapa 07: casa da Laura com 6 cômodos

Pré-requisito: etapa 06 aprovada. Leia `AGENTS.md`, `docs/INTERACOES.md` e `docs/CASA-E-LUGARES.md`.

## Objetivo
Criar `CenaComodo` genérica que lê `public/assets/dados/comodos/<id>.json` e montar sala, cozinha, quarto, banheiro, quintal e lavanderia com os objetos e ações das tabelas de `docs/CASA-E-LUGARES.md`.

## Etapas
1. `CenaComodo` + formato JSON do cômodo (fundo, objetos com posição e estado inicial, portas com destino e ponto de chegada). Teste do carregador.
2. Sala + quarto (sofá, TV, abajur, rádio com dança, cama com dormir e noite, guarda-roupa, baú). Navegação entre eles com fade 250 ms e minimapa.
3. Cozinha (geladeira com itens, fogão e micro-ondas que transformam comida via `receitas.json`, pia, mesa para comer).
4. Banheiro (chuveiro com gotas e vapor, banheira, sanitário com descarga e privacidade, pia com escovar dentes) e lavanderia (máquina transforma roupa suja em limpa).
5. Quintal (mangueira rega flores em 3 estágios, balanço reaproveitado, casinha do pet).
6. Itens levados entre cômodos com persistência; botão "Arrumar tudo" devolve à origem e dá 1 moeda (responsabilidade).
7. Luz por cômodo (escurecer 40%) e 3 segredos com "segundo toque" (moeda sob o tapete, estrelas no teto, patinho na banheira).
8. Multiplayer: amigas convidadas entram na casa; travas de item e snaps; cada uma vê a outra no cômodo atual.

## Critérios de aceite
- Cada objeto das tabelas tem ação e feedback (animação + partícula ou som). Placeholders permitidos, registrados em `docs/ARTE.md`.
- Estado (aberto, ligado, itens, posições) sobrevive a recarregar a página e é o mesmo para as amigas na sala.
- Nenhuma barra de necessidade; nada pune. Ferro só com adulto por perto (conselho gentil).
- Testes, build e checagem de emojis passam; prints de cada cômodo no PR.
