import type { Database } from './banco.types';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Sem configuração, nenhuma requisição é feita e o jogo continua offline. */
export const supabase = url && chave ? createClient<Database>(url, chave, {
  global: { fetch: (entrada, opcoes) => fetch(entrada, { ...opcoes, signal: opcoes?.signal ?? AbortSignal.timeout(10_000) }) },
}) : null;
