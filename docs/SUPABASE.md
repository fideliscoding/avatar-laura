# Supabase: contas, banco e multiplayer

Plano gratuito do Supabase é suficiente. O schema e suas correções estão em `supabase/migrations/`. Aplique os arquivos na ordem numérica.

## 1. Criar o projeto

1. Acesse https://supabase.com, entre com a conta do GitHub e clique em **New project**.
2. Nome: `avatar-laura`. Região: **South America (São Paulo)**. Crie uma senha forte para o banco e guarde num gerenciador de senhas.
3. Espere o projeto ficar pronto (1 a 2 minutos).

## 2. Rodar o SQL

**SQL Editor > New query**, cole todo o conteúdo de `supabase/migrations/0001_init.sql` e clique em **Run**. Depois aplique `0002_contas_e_recompensa_segura.sql`, `0003_fixa_search_path.sql` e `0004_valida_escolhas_pedrinho.sql`, em consultas separadas. Deve aparecer "Success". Em **Table Editor** você verá `profiles`, `avatars`, `missions`, `progress`.

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

## 7. Plano de Realtime (etapa 04)

Usar **Realtime Channels** (Broadcast + Presence), não replicação de tabela, para posição dos jogadores: é mais leve e não grava no banco.

- Canal por sala: `sala:parque:<codigoDaSala>`. A sala é criada pelo responsável e compartilhada por código de convite (6 letras) com amigos aprovados.
- **Presence** (`channel.track`): `{ user_id, apelido, cabelo, x, y, estado }` para saber quem está na sala e desenhar os avatares.
- **Broadcast** eventos:
  - `mover` `{ x, y }` no máximo 10 vezes por segundo (throttle), interpolado no cliente.
  - `brinquedo` `{ tipo }` quando entra num brinquedo.
  - `frase` `{ id }` só com IDs de uma **lista fixa de frases prontas** (o cliente rejeita qualquer ID desconhecido). Sem texto livre.
  - `aceno` `{ tipo }` (aceno, pulo, coração desenhado).
- Autorização: canais privados (`config: { private: true }`) com políticas em `realtime.messages` permitindo só membros da sala (tabela `room_members`, criada na migração da etapa 04).
- Limites do plano gratuito: até 200 conexões simultâneas e 2 milhões de mensagens por mês, suficiente para família e amigos.
- Missões continuam individuais; o multiplayer é para brincar junto.

## 8. Rodar localmente (opcional)

Com a CLI (`npx supabase@2.122.0`) e Docker: `npx supabase start`, depois `npx supabase db reset` aplica as migrações.

## 9. Implementação da etapa 03

Projeto identificado: `Avatar Laura`, URL base `https://ilveddmkikbpskbnjedn.supabase.co`.
Não acrescente `/rest/v1/` à configuração. As quatro migrações foram aplicadas pelo
conector Supabase nesta revisão; não reaplique arquivos já registrados no projeto.
Para outro projeto vazio, aplique os quatro arquivos na ordem.

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
