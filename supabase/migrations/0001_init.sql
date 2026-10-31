-- My Town, My World - schema inicial
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run.
-- Ou com a CLI: supabase db push
--
-- Principios:
--  * Toda tabela tem RLS ligado. Sem politica = ninguem acessa.
--  * Cada jogador so le e escreve as proprias linhas (auth.uid()).
--  * Moedas e missoes concluidas NAO sao gravadas direto pelo cliente: passam pela funcao
--    concluir_missao(), que confere a missao e evita pagar duas vezes.
--  * Nenhum dado pessoal da crianca alem de um apelido. Sem e-mail da crianca em tabelas publicas.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1 linha por usuario autenticado (conta criada pelo responsavel)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  apelido text not null default 'Jogador' check (char_length(apelido) between 1 and 20),
  papel text not null default 'crianca' check (papel in ('crianca', 'responsavel')),
  responsavel_id uuid references public.profiles (id) on delete set null,
  moedas integer not null default 0 check (moedas >= 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- avatars: visual escolhido (cabelo, e no futuro roupa, acessorios, cores)
-- ---------------------------------------------------------------------------
create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  nome text not null default 'Laura' check (char_length(nome) between 1 and 20),
  cabelo text not null default 'liso' check (cabelo in ('liso', 'rabo', 'trancas', 'cacheado', 'coque', 'coquinhos')),
  roupa text not null default 'lilas-estrela',
  extras jsonb not null default '{}'::jsonb,
  principal boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index if not exists avatars_um_principal on public.avatars (user_id) where principal;

-- ---------------------------------------------------------------------------
-- missions: catalogo de missoes (somente leitura para jogadores; editado pelo painel/admin)
-- ---------------------------------------------------------------------------
create table if not exists public.missions (
  id text primary key,                       -- ex.: 'pedrinho-carrinho'
  titulo text not null,
  valor text not null,                       -- ex.: 'Honestidade e empatia'
  lugar text not null default 'parque',
  recompensa_moedas integer not null default 0 check (recompensa_moedas between 0 and 100),
  requer_confirmacao_responsavel boolean not null default false, -- missoes da vida real (futuro)
  ativa boolean not null default true,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- progress: estado de cada missao por jogador
-- ---------------------------------------------------------------------------
create table if not exists public.progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  mission_id text not null references public.missions (id) on delete cascade,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'aguardando_responsavel', 'concluida')),
  escolhas jsonb not null default '[]'::jsonb, -- ex.: ["A","B"] para o responsavel ver o caminho
  concluida_em timestamptz,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, mission_id)
);

-- ---------------------------------------------------------------------------
-- gatilhos
-- ---------------------------------------------------------------------------
create or replace function public.tocar_atualizado_em() returns trigger language plpgsql as $$
begin new.atualizado_em = now(); return new; end $$;

drop trigger if exists t_profiles_upd on public.profiles;
create trigger t_profiles_upd before update on public.profiles for each row execute function public.tocar_atualizado_em();
drop trigger if exists t_avatars_upd on public.avatars;
create trigger t_avatars_upd before update on public.avatars for each row execute function public.tocar_atualizado_em();
drop trigger if exists t_progress_upd on public.progress;
create trigger t_progress_upd before update on public.progress for each row execute function public.tocar_atualizado_em();

-- Cria profile + avatar automaticamente quando uma conta nasce em auth.users
create or replace function public.criar_perfil_novo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, apelido) values (new.id, coalesce(left(new.raw_user_meta_data ->> 'apelido', 20), 'Jogador'))
  on conflict (id) do nothing;
  insert into public.avatars (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists t_auth_novo_usuario on auth.users;
create trigger t_auth_novo_usuario after insert on auth.users for each row execute function public.criar_perfil_novo_usuario();

-- Impede o cliente de mexer em colunas sensiveis do proprio profile (moedas, papel, responsavel)
create or replace function public.proteger_profile() returns trigger language plpgsql as $$
begin
  if current_setting('mtmw.interno', true) is distinct from 'sim' then
    new.moedas = old.moedas; new.papel = old.papel; new.responsavel_id = old.responsavel_id;
  end if;
  return new;
end $$;
drop trigger if exists t_profiles_proteger on public.profiles;
create trigger t_profiles_proteger before update on public.profiles for each row execute function public.proteger_profile();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.avatars  enable row level security;
alter table public.missions enable row level security;
alter table public.progress enable row level security;

-- profiles: o proprio usuario le/edita; o responsavel vinculado pode ler
drop policy if exists profiles_ler on public.profiles;
create policy profiles_ler on public.profiles for select to authenticated
  using (id = (select auth.uid()) or responsavel_id = (select auth.uid()));
drop policy if exists profiles_editar on public.profiles;
create policy profiles_editar on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- avatars: dono faz tudo; outros jogadores autenticados podem LER (necessario para ver amigos no multiplayer)
drop policy if exists avatars_ler on public.avatars;
create policy avatars_ler on public.avatars for select to authenticated using (true);
drop policy if exists avatars_inserir on public.avatars;
create policy avatars_inserir on public.avatars for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists avatars_editar on public.avatars;
create policy avatars_editar on public.avatars for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists avatars_apagar on public.avatars;
create policy avatars_apagar on public.avatars for delete to authenticated using (user_id = (select auth.uid()));

-- missions: qualquer um logado le as ativas; ninguem escreve pelo cliente
drop policy if exists missions_ler on public.missions;
create policy missions_ler on public.missions for select to authenticated using (ativa);

-- progress: dono le e cria/atualiza "em_andamento"; conclusao so pela funcao; responsavel le
drop policy if exists progress_ler on public.progress;
create policy progress_ler on public.progress for select to authenticated
  using (user_id = (select auth.uid())
         or exists (select 1 from public.profiles p where p.id = progress.user_id and p.responsavel_id = (select auth.uid())));
drop policy if exists progress_inserir on public.progress;
create policy progress_inserir on public.progress for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'em_andamento');
drop policy if exists progress_editar on public.progress;
create policy progress_editar on public.progress for update to authenticated
  using (user_id = (select auth.uid()) and status = 'em_andamento')
  with check (user_id = (select auth.uid()) and status = 'em_andamento');

-- ---------------------------------------------------------------------------
-- concluir_missao: unica forma de ganhar moedas. Idempotente (nao paga duas vezes).
-- ---------------------------------------------------------------------------
create or replace function public.concluir_missao(p_mission_id text, p_escolhas jsonb default '[]'::jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_m public.missions%rowtype;
  v_status text;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  select * into v_m from public.missions where id = p_mission_id and ativa;
  if not found then raise exception 'missao inexistente'; end if;
  select status into v_status from public.progress where user_id = v_uid and mission_id = p_mission_id;
  if v_status = 'concluida' then
    return (select moedas from public.profiles where id = v_uid);
  end if;
  if v_m.requer_confirmacao_responsavel then
    insert into public.progress (user_id, mission_id, status, escolhas)
    values (v_uid, p_mission_id, 'aguardando_responsavel', p_escolhas)
    on conflict (user_id, mission_id) do update set status = 'aguardando_responsavel', escolhas = excluded.escolhas;
    return (select moedas from public.profiles where id = v_uid);
  end if;
  insert into public.progress (user_id, mission_id, status, escolhas, concluida_em)
  values (v_uid, p_mission_id, 'concluida', p_escolhas, now())
  on conflict (user_id, mission_id) do update set status = 'concluida', escolhas = excluded.escolhas, concluida_em = now();
  perform set_config('mtmw.interno', 'sim', true);
  update public.profiles set moedas = moedas + v_m.recompensa_moedas where id = v_uid;
  return (select moedas from public.profiles where id = v_uid);
end $$;

revoke all on function public.concluir_missao(text, jsonb) from public, anon;
grant execute on function public.concluir_missao(text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Dados iniciais
-- ---------------------------------------------------------------------------
insert into public.missions (id, titulo, valor, lugar, recompensa_moedas, ordem)
values ('pedrinho-carrinho', 'O carrinho do Pedrinho', 'Honestidade e empatia', 'parque', 15, 1)
on conflict (id) do update set titulo = excluded.titulo, valor = excluded.valor, recompensa_moedas = excluded.recompensa_moedas;
