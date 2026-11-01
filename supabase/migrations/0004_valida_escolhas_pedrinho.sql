-- A integridade das escolhas também é verificada na tabela, inclusive contra null.
alter table public.progress add constraint progress_escolhas_pedrinho_validas check (
  mission_id <> 'pedrinho-carrinho' or (
    jsonb_typeof(escolhas) = 'array'
    and escolhas <@ '["A", "B", "C"]'::jsonb
    and jsonb_array_length(escolhas) <= 64
    and (status <> 'concluida' or coalesce(escolhas ->> -1 = 'B', false))
  )
);
