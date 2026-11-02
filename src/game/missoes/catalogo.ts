import type { Missao } from './tipos';
import { validarMissao } from './motor';
const arquivos = import.meta.glob('../../../public/data/missoes/*.json', { eager: true, query: '?raw', import: 'default' });
export const MISSOES: readonly Missao[] = Object.entries(arquivos).map(([arquivo,conteudo])=>{
  const dados: unknown=JSON.parse(String(conteudo));
  if (!validarMissao(dados)) throw new Error(`Missão inválida: ${arquivo}`);
  return dados;
}).sort((a,b)=>a.id.localeCompare(b.id));
if(new Set(MISSOES.map(m=>m.id)).size!==MISSOES.length) throw new Error('Há missões com identificadores repetidos.');
export function obterMissao(id: string): Missao { const m=MISSOES.find(m=>m.id===id); if(!m)throw new Error('Missão não encontrada.');return m }
