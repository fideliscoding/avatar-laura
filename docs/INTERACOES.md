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

## 10. Implementação da etapa 06

O catálogo validado demonstra três objetos no parque: banco com dois snaps,
sorvete com três mordidas e bebedouro com gotas. As regras dos sete tipos têm
testes puros. Os móveis e ambientes de [Casa e lugares](CASA-E-LUGARES) são o
planejamento de expansão; receitas, bandejas de recipientes, transições com itens
e os demais interiores não estão habilitados nesta etapa. `receitas.json` começa
vazio. O carregamento rejeita campos ausentes e estados iniciais reservados.

Toque no objeto ou use os atalhos do rodapé. O avatar caminha até o ponto de uso.
A mochila tem botão de 64 px, uma mão e seis espaços, com ações por toque para
pegar, guardar, comer e soltar. Tocar no avatar com o sorvete dá uma mordida;
a terceira consome o item. Chão e Levantar liberam o banco. Segurar um objeto
por 0,5 s mostra seu nome. As zonas dos objetos têm pelo menos 64x64 no mundo.
A mochila usa HTML acessível para continuar legível em telas pequenas.

Os sprites novos são placeholders Graphics lilases; a articulação existente
preserva cabelos e pernas. O banco prende a base da saia ao snap, mantendo a
profundidade dos pés virtuais. A mão segue o avatar local/remoto com rotação e
espelhamento e fica em `avatar.depth + 1`. Gotas, migalhas e corações são desenhados.
As poses definitivas e os sons opcionais aguardam arte, conforme [ARTE.md](ARTE.md).

### Autoridade, versões e desconexão

O mundo compartilhado pertence ao dono do convite. O dono precisa estar no parque
para confirmar novas ações. Se abrir mais de uma aba, a menor instância UUID
anunciada em Presence atua como autoridade. A RPC do banco continua comparando
versões, protegendo também a transição entre autoridades. Cada aba tem sua própria
instância: duas abas da mesma conta não podem ocupar simultaneamente o mesmo item.

`pedido` e `confirma` trafegam pelos canais privados existentes
`sala:<id>:<versao>:<autor>`. A autorização do servidor vincula o tópico ao autor;
o canal de controle `sala:<id>` permanece reservado às notificações do servidor.
Só membros aprovados pedem; só confirmações do dono são aceitas. Não há texto
livre: objeto, ação, versão e argumentos são validados, e as falas são constantes
locais com apelidos dos membros aprovados. Pedidos repetidos são deduplicados.

A posse só aparece depois da confirmação persistida, evitando duas mãos exibindo
o mesmo sorvete. O feedback de toque é imediato. Na sala, todas as ações são
gravadas antes do broadcast; fora dela, água usa debounce de um segundo. A
confirmação inclui o horário do servidor; leitores projetam o vencimento da trava
em oito segundos, mesmo se a aba do dono fechar. Renovações ocorrem a cada dois
segundos, inclusive com a mochila aberta. Sem renovação, o item volta à origem;
novas ações compartilhadas aguardam a volta do dono. Cache offline é separado
por dono/leitor e nunca concede posse compartilhada sem confirmação.

## 11. Casa (etapa 07)

`ObjetosSync` agora recebe uma configuração de mundo (`Parque` por padrão ou
`MUNDO_CASA`): catálogo, estados iniciais, transação pura e ações automáticas.
Pedidos e confirmações têm namespace de mundo para não misturar versões.
`aplicarCasa` estende as regras com movimentação atômica entre recipientes e mão,
receitas, lavagem, cultivo, segredos e arrumação. O estado opcional `comodo`
identifica o ambiente e `prontoEm` guarda o prazo de receitas. Lotes/quadro admitem
até 256 estados; a casa cabe em um único lote, sem reset parcial.

Itens guardados em móveis usam `local: consumido` e `aberto: false`; o inventário
do recipiente identifica o item disponível. Um item retirado tem `aberto: true`,
e um alimento comido não reaparece no recipiente. A arrumação restaura o catálogo
inicial. Os campos continuam validados tanto no cliente quanto na RPC.

A zona acompanha a nova posição do objeto solto. `CasaInterface` mantém controles
sem o zoom do mundo, e `PainelCidade.destruir` remove DOM e ouvintes ao fechar.
A assinatura visual ignora renovações de lease, evitando reconstruir o seletor
sem necessidade. A Presence anuncia o cômodo; o parque ignora avatares da casa.
