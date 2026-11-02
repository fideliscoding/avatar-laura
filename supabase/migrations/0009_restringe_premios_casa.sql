-- O ledger só é acessado pela RPC SECURITY DEFINER. A negação explícita mantém
-- a mesma proteção do deny por padrão e documenta a intenção para os advisors.
create policy premios_casa_sem_acesso_direto on private.premios_casa
 for all to anon,authenticated using(false) with check(false);
