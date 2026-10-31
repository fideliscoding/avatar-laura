# Prompt 04 - Multiplayer com amigos (Supabase Realtime)

Pré-requisito: etapa 03 concluída e publicada.

---

Leia `AGENTS.md` (principalmente "Segurança infantil"), `docs/SUPABASE.md` seção 7 e o código de `src/net/`.

Tarefa: permitir que a Laura veja e brinque com amigos aprovados no mesmo parque, em tempo real, **sem chat livre**.

Faça:

1. Migração `supabase/migrations/0003_salas_multiplayer.sql`:
   - `rooms` (id, codigo de 6 letras maiúsculas único, dono_id, criado_em, ativa).
   - `room_members` (room_id, user_id, aprovado boolean, entrou_em). Dono da sala aprova membros.
   - RLS: só o dono cria/edita a sala; usuário pode pedir para entrar (aprovado = false); só membros aprovados leem a lista de membros.
   - Políticas em `realtime.messages` para canais privados `sala:<room_id>`: só membros aprovados podem ler (`select`) e enviar (`insert`) broadcast e presence.
   - Função `entrar_na_sala(p_codigo text)` (security definer) que cria o pedido.
2. `src/net/sala.ts` com `supabase.channel('sala:<id>', { config: { private: true, presence: { key: user_id } } })`:
   - Presence com `{ user_id, apelido, cabelo, x, y, estado }`.
   - Broadcast `mover` (throttle de 100 ms, só quando mudou), `brinquedo`, `frase`, `aceno`.
   - Interpolação suave das posições remotas (lerp) e remoção de quem saiu.
3. **Frases prontas** em `src/game/frases.ts`: lista fixa com id e texto, por exemplo: `oi` "Oi!", `brincar` "Vamos brincar?", `balanco` "Vamos no balanço?", `obrigado` "Obrigado!", `muito-bem` "Muito bem!", `desculpa` "Desculpa!", `tchau` "Tchau!". O cliente só envia e só aceita ids dessa lista; qualquer outro id é ignorado. Teste isso.
4. Interface no parque (no estilo do jogo, sem emojis):
   - Botão "Amigos": criar sala (mostra o código grande para o adulto compartilhar), entrar com código, lista de pedidos para aprovar (só o dono).
   - Botão de frases: abre um painel com as frases prontas; ao tocar, aparece o balão de fala sobre o avatar para todos.
   - Botão de aceno: aceno, pulo e coração desenhado em código.
   - Avatares remotos usam o cabelo deles e o apelido em uma etiqueta pequena.
5. Limites: no máximo 6 jogadores por sala; se cair a conexão, tenta reconectar e mostra "Reconectando...".
6. Testes Vitest para: validação de frases, throttle, interpolação e regras de sala (lógica pura em `src/game/` ou `src/net/` com dependências simuladas).

Não faça: chat de texto, voz, fotos, links, convites públicos ou lista de jogadores desconhecidos.

## Critérios de aceite

- [ ] Duas contas diferentes, em dois navegadores, na mesma sala aprovada, se veem andando suavemente e nos brinquedos.
- [ ] Frases e acenos aparecem para ambos em menos de 1 segundo.
- [ ] Uma terceira conta que não foi aprovada não recebe nem envia nada no canal (testar e relatar no PR).
- [ ] Não existe nenhum campo de texto livre visível a outros jogadores.
- [ ] Offline/sem conta, o jogo continua funcionando sozinho.
- [ ] Build, testes e check de emojis passam. Docs atualizadas. PR em pt-BR com prints e checklist.
