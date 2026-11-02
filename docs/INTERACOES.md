# Sistema genérico de interações (Phaser 3)

Inspirado na sensação de "tudo é tocável" (ver `PESQUISA-AVATAR-WORLD.md`), com regras nossas. Sem emojis, sem compras, sem punição.

## 1. Arquitetura

```
public/assets/dados/objetos.json      catálogo de tipos de objeto (dados)
public/assets/dados/comodos/*.json    instâncias por cômodo (posição, estado inicial)
src/game/interacao/                   lógica pura, sem Phaser, com testes
  tipos.ts          tipos TS do catálogo e do estado
  regras.ts         aplicarAcao(estado, acao) -> { estado, efeitos[] }
  inventario.ts     mão + mochila
  travas.ts         posse/lock no multiplayer
src/scenes/interacao/
  ObjetoInterativo.ts   Sprite + zona de toque + desenho do estado
  Avatar.ts             poses, mão, caminhar até ponto
  GerenteInteracao.ts   entrada (toque/arrasto), chama regras, toca efeitos
  Efeitos.ts            animação, partículas, som
src/net/objetosSync.ts  Supabase (persistência + Realtime)
```

Fluxo: toque -> `GerenteInteracao` identifica alvo -> avatar caminha até `pontoUso` -> `regras.aplicarAcao` (pura) devolve novo estado e lista de `efeitos` (`pose`, `anim`, `particulas`, `som`, `fala`) -> cena executa os efeitos -> `objetosSync` envia a mudança.

## 2. Objetos por dados (JSON)

```json
{
  "id": "geladeira",
  "tipo": "recipiente",
  "sprite": { "fechado": "geladeira-fechada", "aberto": "geladeira-aberta" },
  "origem": [0.5, 1],
  "largura": 140,
  "area": [-60, -220, 120, 220],
  "pontoUso": [0, 20],
  "estadoInicial": { "aberto": false, "itens": ["suco", "maca", "leite"] },
  "capacidade": 6,
  "som": { "abrir": "porta-geladeira", "fechar": "fecha-suave" }
}
```

Tipos e campos específicos:
| tipo | estado | ação no toque | extras |
|---|---|---|---|
| `pegavel` | `dono`, `local` (cômodo, x, y) ou `naMao` | pega / solta / arrasta | `comestivel`, `bebivel`, `combinaCom` |
| `assento` | `ocupantes[]` | sentar no snap livre | `snaps[]` com x, y, `pose: sentado`, `virado` |
| `cama` | `ocupantes[]`, `noite` | deitar; 2o toque dorme (zZz desenhado) | `snaps[]` com `pose: deitado` |
| `aparelho` | `ligado` (+ `modo`) | liga/desliga | `spriteLigado`, `loopAnim`, `somLoop`, `aceita` (ex.: micro-ondas aceita comida -> vira `comida-quente`) |
| `recipiente` | `aberto`, `itens[]` | abre/fecha; com aberto mostra bandeja de itens | `capacidade`, `aceita[]` |
| `porta` | `aberta`, `destino` | abre e leva para `destino` (cômodo ou lugar) | `ponto chegada` no destino |
| `agua` | `ligado` | chuveiro/pia/banheira | `particulas: gotas/vapor/bolhas`, `pose` (banho, lavar mãos, escovar) |

Combinações ficam numa tabela à parte (`receitas.json`): `{ "a": "pao", "b": "torradeira", "resultado": "torrada" }`. Segredos = combinações e "segundo toque" (`acao2`).

## 3. Snaps e poses
- Cada assento/cama tem `snaps`. O avatar caminha até o snap mais próximo livre, recebe `pose` e `depth` do snap (cama: `depth` do snap + 1 para ficar sobre o colchão; cobertor é sprite separado acima).
- Poses do avatar: `em-pe`, `andando`, `sentado`, `deitado`, `dormindo`, `segurando`, `comendo`, `dancando`, `tomando-banho`. Enquanto faltar arte, `sentado` = sprite em pé recortado em 70% com leve inclinação e `deitado` = sprite girado 90 graus (placeholder).
- Mão: o sprite da pose tem ponto `mao` (x, y relativos à origem) em `docs/ARTE.md`. Item na mão segue esse ponto a cada frame, `depth = avatar.depth + 1`, e espelha com o avatar.
- Sair: tocar no chão ou botão "Levantar".

## 4. Profundidade
`depth = y` dos pés/base para tudo de chão. Objetos de parede (quadro, janela) `depth` fixo baixo. Item sobre mesa: `depth = mesa.depth + 1` e `apoio = mesa`.

## 5. Inventário
- **Mão**: 1 item. Pegar outro troca (o anterior vai para a mochila se houver espaço, senão é solto no chão).
- **Mochila**: 6 espaços, botão no canto inferior. Arrastar da mochila para a mão ou para o cenário.
- Item levado entre cômodos/lugares: `local` muda quando o jogador solta no novo cômodo. Itens "da casa" lembram a origem; botão "Arrumar tudo" na casa devolve cada um ao lugar (ensina responsabilidade).

## 6. Persistência (Supabase)
Tabela `objetos_estado(dono uuid, lugar text, objeto_id text, estado jsonb, atualizado_em timestamptz, versao int)`, PK (dono, lugar, objeto_id). RLS: só o dono escreve; amigos aprovados no convite leem. Salvar com debounce de 1 s ao mudar; localStorage como cache offline. Inventário em `perfis.inventario jsonb`.

## 7. Multiplayer (sala de convite, PR 5)
- O dono da casa/sala é a **autoridade**. Canal Realtime `sala:<id>` com broadcast de `pedido` e `confirma`.
- Pegar item: cliente envia `pedido{objeto, versao}`; autoridade aceita o primeiro que chega com `versao` atual, grava `trava{objeto, jogador, ate}` (8 s, renovada enquanto segura) e confirma. Os outros veem o item na mão da amiga e recebem animação gentil "Já está com a Bia" (sem texto de erro).
- Assentos: snap ocupado não aceita outro. Aparelhos: última ação vale (liga/desliga não precisa trava).
- Saiu da sala ou caiu: travas expiram e item volta ao chão onde estava.
- Otimista: anima localmente na hora; se negado, desfaz com tween suave.

## 8. Feedback
- Toque em qualquer objeto: "squash" (escala 1.08 -> 1, 120 ms) + anel de toque já existente.
- Ligar aparelho: troca sprite + loop (TV pisca cores, fogão chama, máquina treme). Luz: retângulo escuro 40% sobre o cômodo.
- Partículas (texturas desenhadas em `Graphics`): gotas, vapor, bolhas, brilho, zZz, corações, migalhas, notas musicais.
- Som curto para cada ação (abrir, fechar, clique, água em loop, mastigar, ronco suave), volume baixo e botão de mudo.
- Objeto com segredo: brilho sutil a cada 20 s só depois de 1 min sem achar.

## 9. Acessibilidade para toque
- Área mínima de toque 64x64 px (no palco 1280x720), mesmo que o sprite seja menor.
- Toque simples faz a ação principal; arrastar é opcional (sempre há caminho por toque: tocar item -> pega; tocar destino -> solta).
- Sem toque duplo obrigatório: o "segundo toque" é só para segredos.
- Prioridade quando objetos se sobrepõem: o de maior `depth`; segurar 0,5 s mostra o nome do objeto em texto grande.
- Textos curtos, fonte Fredoka mínimo 22 px, ícones desenhados nos botões.
