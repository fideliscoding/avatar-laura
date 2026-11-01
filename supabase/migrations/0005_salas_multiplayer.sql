-- Salas privadas: o dono aprova amigos; no máximo seis contas aprovadas por sala.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^[A-Z]{6}$'),
  dono_id uuid not null references public.profiles(id) on delete cascade,
  criado_em timestamptz not null default now(),
  ativa boolean not null default true,
  versao integer not null default 1 check (versao > 0)
);
create unique index rooms_um_dono_ativo on public.rooms(dono_id) where ativa;
create table public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  aprovado boolean not null default false,
  entrou_em timestamptz not null default now(),
  primary key(room_id,user_id)
);
create index room_members_usuario on public.room_members(user_id,room_id);
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

create function private.membro_aprovado(p_sala uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.room_members where room_id=p_sala and user_id=(select auth.uid()) and aprovado);
$$;
create function private.dono_sala(p_sala uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.rooms where id=p_sala and dono_id=(select auth.uid()));
$$;
create function private.tem_pedido(p_sala uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.room_members where room_id=p_sala and user_id=(select auth.uid()));
$$;
revoke all on function private.membro_aprovado(uuid), private.dono_sala(uuid), private.tem_pedido(uuid) from public, anon;
grant execute on function private.membro_aprovado(uuid), private.dono_sala(uuid), private.tem_pedido(uuid) to authenticated;

create policy rooms_ler on public.rooms for select to authenticated
  using(dono_id=(select auth.uid()) or private.tem_pedido(id));
create policy rooms_criar on public.rooms for insert to authenticated
  with check(dono_id=(select auth.uid()));
create policy rooms_editar on public.rooms for update to authenticated
  using(dono_id=(select auth.uid())) with check(dono_id=(select auth.uid()));
create policy room_members_ler on public.room_members for select to authenticated
  using(user_id=(select auth.uid()) or private.dono_sala(room_id) or (aprovado and private.membro_aprovado(room_id)));
create policy room_members_pedir on public.room_members for insert to authenticated
  with check(user_id=(select auth.uid()) and not aprovado);
create policy room_members_aprovar on public.room_members for update to authenticated
  using(private.dono_sala(room_id)) with check(private.dono_sala(room_id));
-- Escritas são feitas pelas RPCs para manter bloqueio, limite e versão atômicos.
revoke all on public.rooms, public.room_members from anon, authenticated;
grant select on public.rooms, public.room_members to authenticated;

create function public.criar_sala() returns public.rooms
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_sala public.rooms; v_codigo text;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  perform 1 from public.profiles where id=v_uid for update;
  if not found then raise exception 'perfil inexistente'; end if;
  select * into v_sala from public.rooms where dono_id=v_uid and ativa;
  if found then return v_sala; end if;
  for tentativa in 1..16 loop
    select string_agg(chr(65+get_byte(extensions.gen_random_bytes(6),i)%26),'') into v_codigo from generate_series(0,5) i;
    begin
      insert into public.rooms(codigo,dono_id) values(v_codigo,v_uid) returning * into v_sala;
      insert into public.room_members(room_id,user_id,aprovado) values(v_sala.id,v_uid,true);
      return v_sala;
    exception when unique_violation then null;
    end;
  end loop;
  raise exception 'nao foi possivel criar sala';
end $$;

create function public.entrar_na_sala(p_codigo text) returns public.rooms
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_sala public.rooms; v_codigo text:=upper(btrim(p_codigo));
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  if v_codigo is null or v_codigo !~ '^[A-Z]{6}$' then raise exception 'codigo invalido'; end if;
  select * into v_sala from public.rooms where codigo=v_codigo and ativa for update;
  if not found then raise exception 'sala nao encontrada'; end if;
  if not exists(select 1 from public.room_members where room_id=v_sala.id and user_id=v_uid) then
    if (select count(*) from public.room_members where room_id=v_sala.id and not aprovado)>=12 then
      raise exception 'pedidos cheios';
    end if;
    insert into public.room_members(room_id,user_id) values(v_sala.id,v_uid);
  end if;
  return v_sala;
end $$;

create function public.consultar_sala(p_sala uuid) returns public.rooms
language plpgsql security definer set search_path = '' as $$
declare v_sala public.rooms;
begin
  if auth.uid() is null or not private.tem_pedido(p_sala) then raise exception 'acesso negado'; end if;
  select * into v_sala from public.rooms where id=p_sala;
  if not found then raise exception 'sala nao encontrada'; end if;
  return v_sala;
end $$;

create function public.listar_membros_sala(p_sala uuid)
returns table(user_id uuid,apelido text,cabelo text,aprovado boolean)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.membro_aprovado(p_sala) then raise exception 'acesso negado'; end if;
  return query select m.user_id,p.apelido,coalesce(a.cabelo,'liso'),m.aprovado
    from public.room_members m join public.profiles p on p.id=m.user_id
    left join public.avatars a on a.user_id=m.user_id and a.principal
    where m.room_id=p_sala and (m.aprovado or private.dono_sala(p_sala)) order by m.entrou_em;
end $$;

create function public.aprovar_membro(p_sala uuid,p_usuario uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_sala public.rooms;
begin
  if auth.uid() is null then raise exception 'nao autenticado'; end if;
  select * into v_sala from public.rooms where id=p_sala for update;
  if not found or v_sala.dono_id<>auth.uid() or not v_sala.ativa then raise exception 'acesso negado'; end if;
  if exists(select 1 from public.room_members where room_id=p_sala and user_id=p_usuario and aprovado) then return; end if;
  if (select count(*) from public.room_members where room_id=p_sala and aprovado)>=6 then raise exception 'sala cheia'; end if;
  update public.room_members set aprovado=true where room_id=p_sala and user_id=p_usuario;
  if not found then raise exception 'pedido inexistente'; end if;
end $$;

create function public.sair_da_sala(p_sala uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'nao autenticado'; end if;
  perform 1 from public.rooms where id=p_sala for update;
  if private.dono_sala(p_sala) then
    update public.rooms set ativa=false,versao=versao+1 where id=p_sala;
    perform realtime.send('{"recarregar":true}'::jsonb,'sala_alterada','sala:'||p_sala::text,true);
  else
    delete from public.room_members where room_id=p_sala and user_id=auth.uid();
  end if;
end $$;

create function private.notificar_sala() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_sala uuid;
begin
  v_sala:=case when tg_op='DELETE' then old.room_id else new.room_id end;
  if (tg_op='UPDATE' and new.aprovado is distinct from old.aprovado) or (tg_op='DELETE' and old.aprovado) then
    update public.rooms set versao=versao+1 where id=v_sala;
  end if;
  if exists(select 1 from public.rooms where id=v_sala and ativa) then
    perform realtime.send('{"recarregar":true}'::jsonb,'sala_alterada','sala:'||v_sala::text,true);
  end if;
  return null;
end $$;
create trigger t_sala_alterada after insert or update of aprovado or delete on public.room_members for each row execute function private.notificar_sala();
revoke all on function private.notificar_sala() from public,anon,authenticated;

-- O tópico de cada avatar vincula o remetente à conta autenticada. O cliente não
-- confia em user_id/apelido enviados no payload. A versão muda após aprovações/saídas,
-- porque o Realtime guarda o resultado da autorização durante a conexão.
create function private.acesso_canal(p_topico text,p_escrita boolean) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v_partes text[]:=string_to_array(p_topico,':'); v_sala public.rooms; v_alvo uuid;
begin
  if auth.uid() is null or coalesce(array_length(v_partes,1),0) not in (2,4) or v_partes[1]<>'sala' then return false; end if;
  begin
    select * into v_sala from public.rooms where id=v_partes[2]::uuid and ativa;
  exception when invalid_text_representation then return false;
  end;
  if not found or not private.membro_aprovado(v_sala.id) then return false; end if;
  if array_length(v_partes,1)=2 then return not p_escrita; end if;
  if v_partes[3]<>v_sala.versao::text then return false; end if;
  begin v_alvo:=v_partes[4]::uuid; exception when invalid_text_representation then return false; end;
  if not exists(select 1 from public.room_members where room_id=v_sala.id and user_id=v_alvo and aprovado) then return false; end if;
  return not p_escrita or v_alvo=auth.uid();
end $$;
revoke all on function private.acesso_canal(text,boolean) from public,anon;
grant execute on function private.acesso_canal(text,boolean) to authenticated;

-- RLS de realtime.messages já é gerenciada pelo Supabase; não alterar a tabela.
create policy salas_receber on realtime.messages for select to authenticated
  using(extension in ('broadcast','presence') and private.acesso_canal((select realtime.topic()),false));
create policy salas_enviar on realtime.messages for insert to authenticated
  with check(extension in ('broadcast','presence') and private.acesso_canal((select realtime.topic()),true));

revoke all on function public.criar_sala(), public.entrar_na_sala(text), public.consultar_sala(uuid), public.listar_membros_sala(uuid), public.aprovar_membro(uuid,uuid), public.sair_da_sala(uuid) from public,anon;
grant execute on function public.criar_sala(), public.entrar_na_sala(text), public.consultar_sala(uuid), public.listar_membros_sala(uuid), public.aprovar_membro(uuid,uuid), public.sair_da_sala(uuid) to authenticated;
