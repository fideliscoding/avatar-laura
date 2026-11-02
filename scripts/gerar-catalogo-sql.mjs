import { readFileSync } from 'node:fs';
const id=process.argv[2];
if(!id || !/^[a-z][a-z0-9-]*$/.test(id))throw new Error('Uso: node scripts/gerar-catalogo-sql.mjs identificador-da-missao');
const m=JSON.parse(readFileSync(new URL(`../public/data/missoes/${id}.json`,import.meta.url),'utf8'));
if(m.id!==id || !Number.isInteger(m.recompensa)||m.recompensa<1||m.recompensa>100)throw new Error('Identificador ou recompensa inválida.');
const q=texto=>`'${String(texto).replaceAll("'","''")}'`;
process.stdout.write(`-- Catálogo gerado do JSON; aplique em uma migração nova.\ninsert into public.missions(id,titulo,valor,lugar,recompensa_moedas,definicao) values (${[q(m.id),q(m.titulo),q(m.valor),q(m.lugar),m.recompensa,q(JSON.stringify(m))+'::jsonb'].join(',')}) on conflict(id) do update set titulo=excluded.titulo,valor=excluded.valor,lugar=excluded.lugar,recompensa_moedas=excluded.recompensa_moedas,definicao=excluded.definicao;\n`);
