-- Estados pertencem ao dono do mundo; o servidor serializa versões e concede leases de 8 s.
create function private.inventario_valido(p jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
begin
 if p is null or jsonb_typeof(p)<>'object' or p-array['mao','mochila']<>'{}'::jsonb then return false; end if;
 if coalesce(jsonb_typeof(p->'mao'),'') not in ('null','string') or coalesce(jsonb_typeof(p->'mochila'),'')<>'array' then return false;end if;
 if jsonb_array_length(p->'mochila')>6 then return false;end if;
 if jsonb_typeof(p->'mao')='string' and p->>'mao' !~ '^[a-z][a-z0-9-]{0,79}$' then return false;end if;
 if exists(select 1 from jsonb_array_elements(p->'mochila') e where jsonb_typeof(e)<>'string' or e#>>'{}' !~ '^[a-z][a-z0-9-]{0,79}$' or e=p->'mao') then return false;end if;
 return (select count(*)=count(distinct value) from jsonb_array_elements(p->'mochila'));
end $$;
revoke all on function private.inventario_valido(jsonb) from public,anon;
grant execute on function private.inventario_valido(jsonb) to authenticated;
alter table public.profiles add column inventario jsonb not null default '{"mao":null,"mochila":[]}'::jsonb;
alter table public.profiles add constraint profiles_inventario_valido check(private.inventario_valido(inventario));
grant update(inventario) on public.profiles to authenticated;

create table public.objetos_estado(
 dono uuid not null references public.profiles(id) on delete cascade,
 lugar text not null check(char_length(lugar) between 1 and 40),
 objeto_id text not null check(objeto_id ~ '^[a-z][a-z0-9-]{0,79}$'),
 estado jsonb not null check(jsonb_typeof(estado)='object' and octet_length(estado::text)<12000),
 atualizado_em timestamptz not null default now(),
 versao integer not null default 0 check(versao>=0),
 primary key(dono,lugar,objeto_id),check((estado->>'versao')::integer=versao)
);
alter table public.objetos_estado enable row level security;
create function private.amigo_do_mundo(p_dono uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.rooms r join public.room_members m on m.room_id=r.id
 where r.dono_id=p_dono and r.ativa and m.user_id=(select auth.uid()) and m.aprovado);
$$;
revoke all on function private.amigo_do_mundo(uuid) from public,anon;
grant execute on function private.amigo_do_mundo(uuid) to authenticated;
create policy objetos_ler on public.objetos_estado for select to authenticated using(dono=(select auth.uid()) or private.amigo_do_mundo(dono));
create policy objetos_criar on public.objetos_estado for insert to authenticated with check(dono=(select auth.uid()));
create policy objetos_editar on public.objetos_estado for update to authenticated using(dono=(select auth.uid())) with check(dono=(select auth.uid()));
create policy objetos_apagar on public.objetos_estado for delete to authenticated using(dono=(select auth.uid()));
-- Mesmo o dono escreve pela RPC, para não contornar comparação de versão/atomicidade.
revoke all on public.objetos_estado from public,anon,authenticated;
grant select on public.objetos_estado to authenticated;

create function public.ler_objetos(p_dono uuid,p_lugar text) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('estados',coalesce(jsonb_agg(estado order by objeto_id),'[]'::jsonb),'agora',floor(extract(epoch from statement_timestamp())*1000))
 from public.objetos_estado where dono=p_dono and lugar=p_lugar;
$$;
revoke all on function public.ler_objetos(uuid,text) from public,anon;
grant execute on function public.ler_objetos(uuid,text) to authenticated;

create function public.guardar_objetos(p_lugar text,p_estados jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 v_uid uuid:=auth.uid(); v_item jsonb;v_s jsonb;v_id text;v_base integer;v_nova integer;
 v_atual public.objetos_estado;v_ate bigint;v_jogador uuid;v_instancia uuid;v_o jsonb;v_ocupantes jsonb;v_resultado jsonb:='[]';v_chave text;
begin
 if v_uid is null then raise exception 'nao autenticado';end if;
 if p_lugar is null or char_length(p_lugar) not between 1 and 40 or p_estados is null or jsonb_typeof(p_estados)<>'array' then raise exception 'dados invalidos';end if;
 if jsonb_array_length(p_estados) not between 1 and 32 then raise exception 'lote invalido';end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_estados))<>jsonb_array_length(p_estados) then raise exception 'objeto repetido';end if;
 perform 1 from public.profiles where id=v_uid for update;
 if not found then raise exception 'perfil inexistente';end if;
 v_ate:=floor(extract(epoch from clock_timestamp())*1000)+8000;
 for v_item in select value from jsonb_array_elements(p_estados) order by value->>'id' loop
  v_id:=v_item->>'id';v_s:=v_item->'estado';
  if v_id is null or v_id !~ '^[a-z][a-z0-9-]{0,79}$' or jsonb_typeof(v_s)<>'object' or v_s->>'id'<>v_id or v_s->>'lugar'<>p_lugar then raise exception 'objeto invalido';end if;
  if v_s-array['id','tipo','versao','local','lugar','x','y','origem','trava','ocupantes','aberto','ligado','modo','itens','mordidas','noite']<>'{}'::jsonb then raise exception 'campo invalido';end if;
  if coalesce(v_s->>'tipo','') not in ('pegavel','assento','cama','aparelho','recipiente','porta','agua') or coalesce(v_s->>'local','') not in ('chao','mao','mochila','consumido') then raise exception 'tipo invalido';end if;
  foreach v_chave in array array['versao','x','y','modo','mordidas'] loop
   if coalesce(jsonb_typeof(v_s->v_chave),'')<>'number' then raise exception 'numero invalido';end if;
  end loop;
  foreach v_chave in array array['aberto','ligado','noite'] loop
   if coalesce(jsonb_typeof(v_s->v_chave),'')<>'boolean' then raise exception 'estado invalido';end if;
  end loop;
  if (v_s->>'x')::numeric not between 0 and 1280 or (v_s->>'y')::numeric not between 0 and 720 or (v_s->>'mordidas')::integer not between 0 and 3 or (v_s->>'modo')::integer not between 0 and 2 then raise exception 'limite invalido';end if;
  if coalesce(jsonb_typeof(v_s->'origem'),'')<>'object' or coalesce(jsonb_typeof(v_s->'ocupantes'),'')<>'array' or coalesce(jsonb_typeof(v_s->'itens'),'')<>'array' then raise exception 'colecao invalida';end if;
  if coalesce(jsonb_typeof(v_s->'origem'->'x'),'')<>'number' or coalesce(jsonb_typeof(v_s->'origem'->'y'),'')<>'number' then raise exception 'origem invalida';end if;
  if (v_s->'origem'->>'x')::numeric not between 0 and 1280 or (v_s->'origem'->>'y')::numeric not between 0 and 720 then raise exception 'origem invalida';end if;
  if jsonb_array_length(v_s->'ocupantes')>6 or jsonb_array_length(v_s->'itens')>6 then raise exception 'capacidade invalida';end if;
  v_base:=(v_item->>'base')::integer;v_nova:=(v_s->>'versao')::integer;
  if v_base is null or v_base<0 or v_nova<=v_base then raise exception 'versao invalida';end if;
  insert into public.objetos_estado(dono,lugar,objeto_id,estado,versao)
    values(v_uid,p_lugar,v_id,jsonb_set(v_s,'{versao}','0'),0) on conflict do nothing;
  select * into v_atual from public.objetos_estado where dono=v_uid and lugar=p_lugar and objeto_id=v_id for update;
  if v_atual.versao<>v_base then raise exception using errcode='40001',message='versao antiga';end if;
  if v_s->>'local' in ('mao','mochila') then
   if coalesce(jsonb_typeof(v_s->'trava'),'')<>'object' then raise exception 'posse invalida';end if;
   v_jogador:=(v_s->'trava'->>'jogador')::uuid;v_instancia:=(v_s->'trava'->>'instancia')::uuid;
   if v_jogador is null or v_instancia is null or (v_jogador<>v_uid and not exists(select 1 from public.rooms r join public.room_members m on m.room_id=r.id where r.dono_id=v_uid and r.ativa and m.aprovado and m.user_id=v_jogador)) then raise exception 'jogador nao aprovado';end if;
   v_s:=jsonb_set(v_s,'{trava,ate}',to_jsonb(v_ate));
  else v_s:=jsonb_set(v_s,'{trava}','null');end if;
  v_ocupantes:='[]';
  for v_o in select value from jsonb_array_elements(v_s->'ocupantes') loop
   v_jogador:=(v_o->>'jogador')::uuid;v_instancia:=(v_o->>'instancia')::uuid;
   if v_jogador is null or v_instancia is null or v_o->>'snap' is null or (v_o->>'snap')::integer not between 0 and 5 or (v_jogador<>v_uid and not exists(select 1 from public.rooms r join public.room_members m on m.room_id=r.id where r.dono_id=v_uid and r.ativa and m.aprovado and m.user_id=v_jogador)) then raise exception 'ocupante nao aprovado';end if;
   v_ocupantes:=v_ocupantes||jsonb_build_array(jsonb_set(v_o,'{ate}',to_jsonb(v_ate)));
  end loop;
  if (select count(distinct value->>'snap') from jsonb_array_elements(v_ocupantes))<>jsonb_array_length(v_ocupantes) then raise exception 'snap ocupado';end if;
  v_s:=jsonb_set(v_s,'{ocupantes}',v_ocupantes);
  update public.objetos_estado set estado=v_s,versao=v_nova,atualizado_em=clock_timestamp() where dono=v_uid and lugar=p_lugar and objeto_id=v_id;
  v_resultado:=v_resultado||jsonb_build_array(v_s);
 end loop;
 if exists(select 1 from public.objetos_estado o where dono=v_uid and lugar=p_lugar and estado->>'local' in ('mao','mochila') and (estado->'trava'->>'ate')::numeric>v_ate-8000
 group by estado->'trava'->>'jogador'
 having count(*) filter(where estado->>'local'='mao')>1 or count(*) filter(where estado->>'local'='mochila')>6) then raise exception 'inventario cheio';end if;
 if exists(select 1 from public.objetos_estado o cross join lateral jsonb_array_elements(o.estado->'ocupantes') e where o.dono=v_uid and o.lugar=p_lugar and (e->>'ate')::numeric>v_ate-8000 group by e->>'jogador' having count(*)>1) then raise exception 'avatar ja sentado';end if;
 return jsonb_build_object('estados',v_resultado,'agora',v_ate-8000);
end $$;
revoke all on function public.guardar_objetos(text,jsonb) from public,anon;
grant execute on function public.guardar_objetos(text,jsonb) to authenticated;
