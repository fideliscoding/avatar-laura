-- Apelidos validados também no servidor e saldo protegido por privilégios de coluna.
create or replace function public.apelido_valido(p_apelido text)
returns boolean language sql immutable set search_path = '' as $$
  select p_apelido is not null
    and p_apelido = btrim(p_apelido)
    and p_apelido ~ '^[[:alnum:] ]{1,20}$'
    and translate(lower(p_apelido), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')
      !~ '(merda|porra|caralho|buceta|puta|foder|fuck|shit)';
$$;
alter table public.profiles add constraint profiles_apelido_seguro check (public.apelido_valido(apelido));

create or replace function public.criar_perfil_novo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_apelido text := btrim(coalesce(new.raw_user_meta_data ->> 'apelido', 'Jogador'));
begin
  if not public.apelido_valido(v_apelido) then raise exception 'apelido invalido'; end if;
  insert into public.profiles (id, apelido) values (new.id, v_apelido) on conflict (id) do nothing;
  insert into public.avatars (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
revoke all on function public.criar_perfil_novo_usuario() from public, anon, authenticated;

revoke update on public.profiles from anon, authenticated;
grant update (apelido) on public.profiles to authenticated;
grant select on public.profiles, public.avatars, public.missions, public.progress to authenticated;
grant insert, update, delete on public.avatars to authenticated;
grant insert, update on public.progress to authenticated;

-- Bloquear o perfil antes de consultar a conclusão serializa chamadas simultâneas.
-- A RLS da 0001 continua ativa; a única escrita de saldo fica nesta função.
create or replace function public.concluir_missao(p_mission_id text, p_escolhas jsonb default '[]'::jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_m public.missions%rowtype;
  v_status text;
  v_saldo integer;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  select moedas into v_saldo from public.profiles where id = v_uid for update;
  if not found then raise exception 'perfil inexistente'; end if;
  select * into v_m from public.missions where id = p_mission_id and ativa;
  if not found then raise exception 'missao inexistente'; end if;
  select status into v_status from public.progress where user_id = v_uid and mission_id = p_mission_id;
  if v_status = 'concluida' then return v_saldo; end if;
  if p_escolhas is null or jsonb_typeof(p_escolhas) <> 'array' then raise exception 'escolhas invalidas'; end if;
  if jsonb_array_length(p_escolhas) > 64 then raise exception 'escolhas invalidas'; end if;
  if exists (select 1 from jsonb_array_elements_text(p_escolhas) escolha where escolha not in ('A','B','C')) then
    raise exception 'escolhas invalidas';
  end if;
  if p_mission_id = 'pedrinho-carrinho' and (jsonb_array_length(p_escolhas) = 0 or p_escolhas ->> -1 <> 'B') then
    raise exception 'missao ainda nao concluida';
  end if;
  if v_m.requer_confirmacao_responsavel then
    insert into public.progress (user_id, mission_id, status, escolhas)
    values (v_uid, p_mission_id, 'aguardando_responsavel', p_escolhas)
    on conflict (user_id, mission_id) do update set status = 'aguardando_responsavel', escolhas = excluded.escolhas;
    return v_saldo;
  end if;
  insert into public.progress (user_id, mission_id, status, escolhas, concluida_em)
  values (v_uid, p_mission_id, 'concluida', p_escolhas, now())
  on conflict (user_id, mission_id) do update set status = 'concluida', escolhas = excluded.escolhas, concluida_em = now();
  perform set_config('mtmw.interno', 'sim', true);
  update public.profiles set moedas = moedas + v_m.recompensa_moedas where id = v_uid returning moedas into v_saldo;
  perform set_config('mtmw.interno', 'nao', true);
  return v_saldo;
end $$;
revoke all on function public.concluir_missao(text, jsonb) from public, anon;
grant execute on function public.concluir_missao(text, jsonb) to authenticated;
