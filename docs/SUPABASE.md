# Supabase: contas, banco e multiplayer

Plano gratuito do Supabase é suficiente. O schema está em `supabase/migrations/0001_init.sql`.

## 1. Criar o projeto

1. Acesse https://supabase.com, entre com a conta do GitHub e clique em **New project**.
2. Nome: `avatar-laura`. Região: **South America (São Paulo)**. Crie uma senha forte para o banco e guarde num gerenciador de senhas.
3. Espere o projeto ficar pronto (1 a 2 minutos).

## 2. Rodar o SQL

**SQL Editor > New query**, cole todo o conteúdo de `supabase/migrations/0001_init.sql` e clique em **Run**. Deve aparecer "Success". Em **Table Editor** você verá `profiles`, `avatars`, `missions`, `progress`.

## 3. Configurar Auth

- **Authentication > Providers > Email**: ligado. Recomenda-se "Confirm email" ligado.
- **Authentication > URL Configuration**: Site URL = `https://<seu-usuario>.github.io/avatar-laura/`; em Redirect URLs adicione também `http://localhost:5173/avatar-laura/`.
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
