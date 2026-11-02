-- Catálogo da cidade e validação do percurso antes de pagar a recompensa.
alter table public.missions add column definicao jsonb;
alter table public.missions add constraint missions_definicao_objeto check (definicao is null or jsonb_typeof(definicao)='object');

create function private.caminho_missao_valido(p_definicao jsonb,p_escolhas jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare v_passo text; v_atual jsonb; v_opcao jsonb; v_escolha jsonb;
begin
  if p_definicao is null or p_escolhas is null or jsonb_typeof(p_escolhas)<>'array' then return false; end if;
  if jsonb_array_length(p_escolhas)>64 then return false; end if;
  v_passo:=p_definicao->>'inicio';
  for v_escolha in select value from jsonb_array_elements(p_escolhas) loop
    if jsonb_typeof(v_escolha)<>'string' then return false; end if;
    select value into v_atual from jsonb_array_elements(p_definicao->'passos') where value->>'id'=v_passo;
    if not found or coalesce((v_atual->>'final')::boolean,false) then return false; end if;
    select value into v_opcao from jsonb_array_elements(v_atual->'opcoes') where value->>'id'=v_escolha#>>'{}';
    if not found then return false; end if;
    if not (v_opcao ? 'conselho') then v_passo:=v_opcao->>'proximo'; end if;
  end loop;
  select value into v_atual from jsonb_array_elements(p_definicao->'passos') where value->>'id'=v_passo;
  return found and coalesce((v_atual->>'final')::boolean,false);
end $$;
revoke all on function private.caminho_missao_valido(jsonb,jsonb) from public,anon,authenticated;

insert into public.missions(id,titulo,valor,lugar,recompensa_moedas,ordem,definicao) values ('padaria-troco','Troco a mais','Honestidade','Padaria',10,2,'{"id":"padaria-troco","titulo":"Troco a mais","valor":"Honestidade","lugar":"Padaria","personagens":["Dona Rosa","Laura"],"recompensa":10,"inicio":"troco","passos":[{"id":"troco","personagem":"Dona Rosa","texto":"Aqui está seu pão e o troco. Opa! Você percebeu que recebeu moedas a mais. O que vai fazer?","opcoes":[{"id":"A","texto":"A) Ficar com o troco","conselho":"Esse dinheiro faz falta para a padaria. Que tal avisar a Dona Rosa e devolver o que veio a mais?"},{"id":"B","texto":"B) Avisar e devolver","proximo":"fim"},{"id":"C","texto":"C) Não falar nada","conselho":"A Dona Rosa pode não ter percebido. Você pode ajudar contando com gentileza o que aconteceu."}]},{"id":"fim","personagem":"Dona Rosa","texto":"Obrigada por avisar e devolver o troco! Você agiu com honestidade.","opcoes":[],"final":true}]}'::jsonb) on conflict(id) do update set titulo=excluded.titulo,valor=excluded.valor,lugar=excluded.lugar,recompensa_moedas=excluded.recompensa_moedas,definicao=excluded.definicao;
insert into public.missions(id,titulo,valor,lugar,recompensa_moedas,ordem,definicao) values ('parque-esperar','Esperar a vez','Paciência','Parque',5,3,'{"id":"parque-esperar","titulo":"Esperar a vez","valor":"Paciência","lugar":"Parque","personagens":["Bia","Laura"],"recompensa":5,"inicio":"fila","passos":[{"id":"fila","personagem":"Bia","texto":"Estou terminando minha vez no escorregador. O que você vai fazer?","opcoes":[{"id":"A","texto":"A) Passar na frente","conselho":"A Bia também quer brincar. Esperar a vez deixa a brincadeira boa para todo mundo."},{"id":"B","texto":"B) Esperar a Bia terminar","proximo":"fim"},{"id":"C","texto":"C) Pedir que ela saia agora","conselho":"Cada pessoa tem sua vez. Que tal esperar um pouquinho e combinar de brincar juntas?"}]},{"id":"fim","personagem":"Bia","texto":"Obrigada por esperar! Agora é a sua vez. Brincar com paciência é mais divertido.","opcoes":[],"final":true}]}'::jsonb) on conflict(id) do update set titulo=excluded.titulo,valor=excluded.valor,lugar=excluded.lugar,recompensa_moedas=excluded.recompensa_moedas,definicao=excluded.definicao;
insert into public.missions(id,titulo,valor,lugar,recompensa_moedas,ordem,definicao) values ('pet-bolinha','Cuidar do Bolinha','Responsabilidade','Pet Shop',10,5,'{"id":"pet-bolinha","titulo":"Cuidar do Bolinha","valor":"Responsabilidade","lugar":"Pet Shop","personagens":["Bolinha","Laura"],"recompensa":10,"inicio":"agua","passos":[{"id":"agua","personagem":"Bolinha","texto":"O Bolinha está com sede. Vamos colocar água limpa no potinho?","opcoes":[{"id":"agua","texto":"Dar água","proximo":"comida"}]},{"id":"comida","personagem":"Bolinha","texto":"Agora ele precisa de uma porção de comida própria para filhotes.","opcoes":[{"id":"comida","texto":"Dar comida","proximo":"carinho"}]},{"id":"carinho","personagem":"Bolinha","texto":"Barriguinha cheia! Vamos fazer um carinho com cuidado?","opcoes":[{"id":"carinho","texto":"Fazer carinho","proximo":"fim"}]},{"id":"fim","personagem":"Bolinha","texto":"O Bolinha ficou feliz! Cuidar de um animal é uma responsabilidade de todos os dias.","opcoes":[],"final":true}]}'::jsonb) on conflict(id) do update set titulo=excluded.titulo,valor=excluded.valor,lugar=excluded.lugar,recompensa_moedas=excluded.recompensa_moedas,definicao=excluded.definicao;

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
  if p_mission_id='pedrinho-carrinho' then
    if exists(select 1 from jsonb_array_elements(p_escolhas) e where jsonb_typeof(e)<>'string' or e#>>'{}' not in ('A','B','C'))
       or jsonb_array_length(p_escolhas)=0 or p_escolhas->>-1<>'B' then raise exception 'missao ainda nao concluida'; end if;
  elsif not private.caminho_missao_valido(v_m.definicao,p_escolhas) then raise exception 'missao ainda nao concluida';
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
