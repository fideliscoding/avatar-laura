# Supabase: contas, banco e multiplayer

Plano gratuito do Supabase é suficiente. O schema e suas correções estão em `supabase/migrations/`. Aplique os arquivos na ordem numérica.

## 1. Criar o projeto

1. Acesse https://supabase.com, entre com a conta do GitHub e clique em **New project**.
2. Nome: `avatar-laura`. Região: **South America (São Paulo)**. Crie uma senha forte para o banco e guarde num gerenciador de senhas.
3. Espere o projeto ficar pronto (1 a 2 minutos).

## 2. Rodar o SQL

**SQL Editor > New query**, cole todo o conteúdo de `supabase/migrations/0001_init.sql` e clique em **Run**. Depois aplique `0002_contas_e_recompensa_segura.sql`, `0003_fixa_search_path.sql`, `0004_valida_escolhas_pedrinho.sql`, `0005_salas_multiplayer.sql` e `0006_missoes_cidade.sql`, em consultas separadas. Deve aparecer "Success". Em **Table Editor** você verá `profiles`, `avatars`, `missions`, `progress`, `rooms`, `room_members`.

## 3. Configurar Auth

- **Authentication > Providers > Email**: ligado. Recomenda-se "Confirm email" ligado.
- **Authentication > URL Configuration**: Site URL = `https://fideliscoding.github.io/avatar-laura/`; em Redirect URLs adicione também `http://localhost:5173/avatar-laura/` e `http://localhost:5174/avatar-laura/` (conferência local da conta).
- A conta é do **responsável** (e-mail do Bruno). A criança joga com essa sessão; o apelido dela fica em `profiles.apelido`.

## 4. Chaves

**Project Settings > API**:
- `Project URL` -> `VITE_SUPABASE_URL`
- `anon public` -> `VITE_SUPABASE_ANON_KEY` (pública, pode ir no front)
- `service_role` -> **nunca** usar no front, nunca no repositório, nunca em workflow.

## 5. Tabelas

| Tabela | Conteúdo | Quem lê | Quem escreve |
|---|---|---|---|
| `profiles` | apelido, papel, responsável, moedas | o próprio e o responsável vinculado | o próprio (só apelido; moedas/papel protegidos por gatilho) |
| `avatars` | cabelo, roupa, extras | qualquer usuário logado (para ver amigos) | só o dono |
| `missions` | catálogo (id, título, valor, recompensa) | qualquer usuário logado (ativas) | só pelo painel do Supabase |
| `progress` | status da missão por jogador, escolhas | o próprio e o responsável | o próprio enquanto "em_andamento"; conclusão só via função |

Funções:
- `concluir_missao(p_mission_id, p_escolhas)`: marca concluída e soma a recompensa uma única vez. Se a missão exigir confirmação do responsável, fica "aguardando_responsavel".
- Gatilho `criar_perfil_novo_usuario`: cria profile + avatar quando a conta nasce.
- Gatilho `proteger_profile`: impede o cliente de alterar moedas, papel e responsável.

Uso no front (etapa 03):

```ts
const { data: moedas, error } = await supabase.rpc('concluir_missao', { p_mission_id: 'pedrinho-carrinho', p_escolhas: ['A', 'B'] });
```

## 6. RLS (resumo)

Todas as tabelas têm `enable row level security`. Sem política, nada é acessível. As políticas usam `(select auth.uid())` (forma recomendada pelo Supabase para desempenho). Teste no SQL Editor com usuários diferentes antes de publicar.

## 7. Realtime (etapa 04)

Implementado com **Broadcast + Presence** em canais privados e aprovação pelo
responsável. O controle usa `sala:<id>` e os eventos de cada jogador usam
`sala:<id>:<versao>:<user_id>` para vincular autoria e renovar a autorização.
Posições não são gravadas no banco; missões e moedas continuam individuais.
Detalhes de políticas, eventos, reconexão e evidências estão em
[Multiplayer implementado](#multiplayer-implementado-etapa-04).

## 8. Rodar localmente (opcional)

Com a CLI (`npx supabase@2.122.0`) e Docker: `npx supabase start`, depois `npx supabase db reset` aplica as migrações.

## 9. Implementação da etapa 03

Projeto identificado: `Avatar Laura`, URL base `https://ilveddmkikbpskbnjedn.supabase.co`.
Não acrescente `/rest/v1/` à configuração. As seis migrações foram aplicadas pelo
conector Supabase nesta revisão; não reaplique arquivos já registrados no projeto.
Para outro projeto vazio, aplique os seis arquivos na ordem.

- `0002`: validação de apelido no servidor, grants explícitos, atualização de perfil
  limitada à coluna `apelido` e bloqueio de linha antes de pagar a missão. Isso
  impede pagamentos simultâneos duplicados. A função exige escolha final B para
  a missão do Pedrinho e continua exigindo `auth.uid()`.
- `0003`: fixa o `search_path` das duas funções de gatilho da migração inicial.
- `0004`: adiciona integridade das escolhas do Pedrinho na tabela, rejeitando
  valores nulos ou fora de A/B/C e conclusão sem a escolha final B.
- `src/net/supabase.ts`: cliente opcional, com timeout de rede. Sem as duas variáveis,
  exporta `null` e nenhuma tela de conta ou requisição externa é ativada.
- `src/net/sincronizar.ts`: mescla testável e fila durável por usuário.
- `src/net/sessao.ts`: adapta o SDK, sessão e retransmissão a cada 15 segundos.

O modo convidado mantém `mtmw:progresso:v1`. Cada conta usa
`mtmw:conta:v1:<id>` e `mtmw:fila:v1:<id>`. Sair conserva as pendências daquela
conta, mas não as envia como outro usuário. Conclusões e moedas do convidado não
são importadas para a conta: refaça a missão com a conta conectada. As moedas
sempre vêm de `profiles`/RPC; o cliente nunca faz update de saldo.

Para configurar o computador, copie `.env.example` para `.env.local`. No GitHub,
Settings > Secrets and variables > Actions, cadastre `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` para o workflow já existente. Não versione arquivos de
ambiente preenchidos. Nenhuma senha do responsável é guardada pelo jogo: os
campos são enviados ao Supabase Auth e apagados após o envio bem-sucedido.

### Verificação

Os testes Vitest simulam a porta do servidor para conferir mescla, fila,
retentativa, ordem, concorrência de envio, isolamento por conta, descarte de
respostas após logout e validação do apelido. Os testes de navegador offline
continuam cobrindo o fluxo anterior.

No projeto real, uma conta temporária foi usada para verificar login, cabelo,
missão e saldo em outro navegador, fila sem rede e logout. A tentativa feita no
contexto do navegador, `from('profiles').update({ moedas: 999 })`, recebeu
`42501` (permissão negada); o saldo permaneceu 0 antes da missão e passou a 15
somente após a RPC. Chamadas repetidas mantiveram o saldo em 15; oito primeiras conclusões simultâneas, após reiniciar apenas os dados da conta de teste, também terminaram com saldo 15.
A conta temporária foi removida após os testes; não contém dados da criança.

### Conferência manual do responsável antes de publicar

1. Confirme Email habilitado e a Site URL/Redirect URLs descritas acima no painel.
2. Com a versão conectada, escolha Criar conta, informe apelido e e-mail do adulto.
3. Abra o e-mail de confirmação e volte para entrar.
4. Escolha Cacheado, conclua a missão e entre em outro navegador.
5. Confira Cacheado, 15 moedas e a missão concluída.

A entrega do e-mail real e a confirmação pelo responsável precisam desta
conferência. A validação automatizada de login usou uma conta temporária já
confirmada; não simula a entrega em uma caixa de e-mail real.

### Avisos dos advisors

O aviso de RPC `SECURITY DEFINER` acessível a usuários autenticados é esperado:
`concluir_missao` é a API de recompensa exigida pelo projeto, confere o usuário,
serializa pagamentos e não é executável por `anon` ou `PUBLIC`. Referência:
[advisory 0029](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
O Auth também reporta proteção contra senhas vazadas desabilitada; avalie a
opção no painel conforme o plano disponível, sem alterar o plano automaticamente:
[documentação de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Multiplayer implementado (etapa 04)

A migração **0005_salas_multiplayer.sql** foi aplicada ao projeto Avatar Laura.
O número 0003 citado originalmente no prompt já pertencia a uma correção aplicada;
nenhuma migração anterior foi alterada. Em projetos vazios, aplique 0001 a 0005.
Os tipos de `src/net/banco.types.ts` foram regenerados do banco real.

`rooms` e `room_members` têm RLS. O dono cria/encerra e aprova; pedir entrada
sempre cria membro pendente. Pendentes só consultam o próprio pedido e a sala,
sem acesso ao elenco. As escritas passam por RPCs autenticadas com `search_path`
vazio. Bloqueios de linha serializam aprovação e limitam a seis aprovados,
incluindo o dono; há no máximo doze pedidos pendentes. Nomes e cabelos do elenco
vêm do servidor, sem aceitar identidade enviada por outro jogador.

Todos os canais usam `private: true`. O canal `sala:<id>` recebe apenas controle
do servidor. Cada autor publica Presence e eventos no tópico privado
`sala:<id>:<versao>:<user_id>`. As políticas de `realtime.messages` conferem sala
ativa, aprovação, versão e identidade do autor para escrita. Essa divisão impede
que um membro envie mensagens fingindo ser outro. A versão muda quando muda a
aprovação ou sai um membro: conexões antigas deixam de receber o tráfego novo,
mesmo com a autorização de Realtime em cache. Não há coordenadas gravadas no banco.

Presence publica a pose inicial e mudanças de cabelo. Broadcast transmite
`mover` a cada 100 ms somente se mudou, além de `brinquedo`, `frase` e `aceno`.
Estados e limites são validados, posições interpoladas e frases desconhecidas
ignoradas. O elenco é consultado a cada dois segundos; o SDK reconecta o socket.
O cliente só envia pelo canal já inscrito, evitando fallback HTTP acidental.
O painel Realtime permite desabilitar **Allow public access** como proteção
adicional; essa configuração global não foi alterada, e o aplicativo usa canais
privados em todas as inscrições.

### Evidências de validação

Três contas temporárias distintas foram usadas em Chromium, incluindo celular
390x844. Duas aprovadas se viram andando e no balanço; a câmera acompanhou o
amigo. Frase chegou em 148 ms e aceno em 72 ms nesta execução local contra o
projeto real, sem promessa de latência para outras redes. IDs de frase inválidos
foram ignorados. Fechar um navegador removeu o avatar no outro. Uma interrupção
de rede mostrou Reconectando e, ao restaurar, retomou sala e movimento.

A terceira conta permaneceu pendente: inscrição privada retornou CHANNEL_ERROR
e recebeu zero eventos. Uma tentativa HTTP de publicar no tópico de outro autor
retornou `ok`/202, mas **não foi entregue** ao jogador aprovado. O Realtime aceita
a requisição e descarta silenciosamente o envio sem autorização; o teste confere
recebimento, não apenas o status HTTP. As contas e salas de teste foram removidas.

Vitest cobre frases/gestos, estados malformados, limite de sala, throttle,
interpolação, isolamento de pendente, retomada de sessão e respostas após troca
de conta. Uma simulação SQL local também valida capacidade, políticas e tópicos.
As capturas estão em [screenshots/multiplayer](screenshots/multiplayer/README.md).

Os advisors continuam apontando as RPCs autenticadas `SECURITY DEFINER` como
superfície de API a revisar (aviso 0029 citado acima), incluindo as seis RPCs de
sala. Elas conferem usuário/permissão e não permitem execução por anon/PUBLIC.
Permanece o aviso anterior de proteção contra senhas vazadas desabilitada.
Não foram detectados novos avisos de RLS ausente ou `search_path` mutável.

## Catálogo da cidade (etapa 05)

A migração `0006_missoes_cidade.sql` foi aplicada ao projeto Avatar Laura. O número
0004 do prompt já estava ocupado; migrações aplicadas permanecem intactas. Ela
cadastra Troco a mais (10), Cuidar do Bolinha (10) e Esperar a vez (5), adicionando
`missions.definicao` com o percurso JSON confiável. Os tipos foram regenerados.
As políticas existentes de `missions`/`progress` continuam ativas; o cliente não
recebe permissão para editar o catálogo ou concluir progresso diretamente.

`concluir_missao` mantém a assinatura e o bloqueio do perfil, pagando uma única
vez por usuário/missão. Para as missões novas, o helper privado
`caminho_missao_valido` repassa os eventos pelo JSON do servidor e exige atingir
o final, na ordem. Água, comida e carinho não podem ser pulados. Conselhos podem
ser repetidos sem punição. A missão do Pedrinho conserva o protocolo A/B/C e a
escolha final B, incluindo a proteção anterior na tabela. A fila agora aceita os
IDs das opções do catálogo, mantém o isolamento por conta e o saldo oficial.

Além da simulação SQL local, uma transação no projeto real criou um usuário
fictício temporário, assumiu a role authenticated e conferiu as quatro conclusões:
10, 20, 25 e 40 moedas. Cuidado incompleto foi recusado, repetir manteve 40 e
atualização direta de moedas continuou negada. Ao final houve ROLLBACK, sem conta
ou progresso de teste persistidos. Não foram usados dados da criança.

Os advisors antes/depois mantiveram os sete avisos de RPCs autenticadas
SECURITY DEFINER e a proteção contra senhas vazadas desabilitada, já explicados
com links acima. Não surgiram novos avisos de RLS ausente ou search_path mutável.
Para cadastrar outra missão online, use o gerador descrito no GDD e uma migração
nova; a recompensa e o percurso aceitos sempre vêm do banco, nunca do cliente.

## Objetos interativos (etapa 06)

A migração `0007_objetos_interativos.sql` está aplicada. `objetos_estado` usa a
chave `(dono,lugar,objeto_id)`, estado JSON, versão e horário do servidor. A RLS
permite ler o próprio mundo ou o de um dono com sala ativa em que o leitor foi
aprovado. Pedidos pendentes não leem os objetos. Escrever exige ser o dono; a
API restringe a escrita à RPC `guardar_objetos`, para não contornar versões.

A RPC serializa lotes pelo perfil do dono, compara a versão confirmada e grava
todas as mudanças ou nenhuma. Ela limita uma mão e seis espaços de mochila,
confere a aprovação de quem segura/senta e fixa o prazo no relógio do servidor
em oito segundos. `ler_objetos` é SECURITY INVOKER, respeita RLS e devolve o
relógio junto dos estados, evitando depender do horário do aparelho.

O cache local é separado por dono e usuário. Alterações livres usam debounce de
um segundo; pegar/soltar/comer/sentar/renovar exigem confirmação imediata para
preservar exclusividade. A coluna real é `profiles.inventario` (o rascunho chamava
perfis), com atualização apenas dessa coluna e validação de mão/mochila. O cache
de inventário não concede posse: a interface deriva os itens das travas ativas.

A simulação local e uma transação no projeto real verificaram versão repetida
recusada, prazo de oito segundos, leitura negada ao pendente e permitida após
aprovação, escrita direta negada e moedas protegidas. A transação terminou com
ROLLBACK e não deixou contas ou estados de teste persistidos.

Na sala de convite, a autoridade grava inclusive as mudanças livres antes de
confirmar por broadcast, para não anunciar versões ainda ausentes no banco.
O debounce de um segundo continua para ações livres individuais e inventário.
Os canais privados por autor da etapa 04 transportam `pedido/confirma`; nenhuma
política permite que uma amiga escreva no tópico do dono. A menor instância
Presence do dono é a autoridade; a comparação de versão da RPC protege disputas
entre abas. Detalhes em [INTERACOES.md](INTERACOES.md#autoridade-versões-e-desconexão).

A conferência com duas contas sintéticas aprovadas em navegadores separados
confirmou um único vencedor para a mesma versão, item visível na mão remota com
`depth = avatar + 1`, água restaurada após recarregar e retorno do sorvete à
origem em 7.688 ms após fechar a aba que o segurava. Sem erros de JavaScript.

O advisor de segurança após a migração informou oito RPCs autenticadas
SECURITY DEFINER (sete anteriores e `guardar_objetos`, intencional para validar
escrita e versão) e a proteção contra senhas vazadas ainda desabilitada. Não há
novos avisos de RLS ausente ou `search_path` mutável. Referências:
[RPCs autenticadas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
e [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
