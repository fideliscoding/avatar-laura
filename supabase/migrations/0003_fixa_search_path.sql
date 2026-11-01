-- As funções de gatilho da migração inicial não precisam resolver objetos por schema.
alter function public.proteger_profile() set search_path = '';
alter function public.tocar_atualizado_em() set search_path = '';
