# Prompt 03 - Supabase: contas, avatar e progresso na nuvem

Antes de colar: crie o projeto no Supabase, rode `supabase/migrations/0001_init.sql` e cadastre os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (veja `docs/SUPABASE.md` e `GUIA-DO-BRUNO.md`). **Não** entregue a service_role key ao Codex.

---

Leia `AGENTS.md`, `docs/GDD.md`, `docs/SUPABASE.md` e `supabase/migrations/0001_init.sql`.

Tarefa: adicionar contas do responsável e salvar avatar, moedas e missões no Supabase, mantendo o modo offline.

Faça:

1. Adicione `@supabase/supabase-js` (versão exata verificada com `npm view @supabase/supabase-js version`).
2. Crie `src/net/supabase.ts` que lê `import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Se faltarem, exporta `null` e o jogo segue offline. Tipos em `src/vite-env.d.ts`.
3. Crie a cena **CenaEntrar** (antes do Criador), no visual do jogo (lilás, Fredoka, botões do `src/ui/Botao.ts`):
   - "Entrar como responsável" (e-mail + senha, ou link mágico) e "Jogar sem conta" (offline).
   - Campos de e-mail e senha como elementos DOM do Phaser (`this.add.dom`) estilizados, com `dom: { createContainer: true }` no config.
   - Texto curto explicando que a conta é do adulto.
   - Criar conta pede um **apelido** para a criança (1 a 20 caracteres, só letras, números e espaço) gravado em `profiles.apelido`.
4. Crie `src/net/sincronizar.ts`:
   - Ao entrar: carrega `profiles` (moedas, apelido), `avatars` (cabelo principal) e `progress`; mescla com o `localStorage` (o maior número de moedas não pode vir do cliente: as moedas oficiais são as do servidor).
   - Ao trocar o cabelo: `update` em `avatars` (mapear índice para id: liso, rabo, trancas, cacheado, coque, coquinhos).
   - Ao aceitar uma missão: `upsert` em `progress` com status `em_andamento` e as escolhas.
   - Ao concluir: `supabase.rpc('concluir_missao', { p_mission_id, p_escolhas })` e usar o valor retornado como saldo de moedas. Nunca somar moedas direto em `profiles` pelo cliente.
   - Falhas de rede não travam o jogo: enfileira e tenta de novo; mostra um aviso discreto "Sem internet, seu progresso será salvo depois".
5. HUD do parque: mostrar o apelido e um botão "Sair" (desloga e volta para CenaEntrar).
6. Escreva testes Vitest para a lógica de mescla e da fila de sincronização (com cliente Supabase simulado; sem rede real nos testes).
7. Se precisar mudar o banco, crie `supabase/migrations/0002_<descricao>.sql` (nunca edite a 0001) e documente em `docs/SUPABASE.md`.

Segurança: só a anon key no front. RLS continua obrigatório. Nenhum dado pessoal da criança além do apelido. Sem chat.

## Critérios de aceite

- [ ] Sem secrets configurados, o jogo funciona exatamente como antes (offline).
- [ ] Com secrets: criar conta, confirmar e-mail, entrar, escolher cabelo, concluir a missão; em outro navegador, entrar na mesma conta mostra o mesmo cabelo, 15 moedas e a missão concluída.
- [ ] Concluir a missão de novo não soma moedas (servidor idempotente).
- [ ] Tentar `update profiles set moedas = 999` pelo cliente não altera as moedas (testar no console do navegador e relatar no PR).
- [ ] `npm run build`, `npm test`, `npm run check:emojis` passam; testes novos para a sincronização.
- [ ] `docs/SUPABASE.md` e `README.md` atualizados. PR em pt-BR com prints e checklist.
