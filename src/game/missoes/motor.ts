import type { ExecucaoMissao, Missao, ResultadoMissao } from './tipos';

export function iniciarMissao(missao: Missao): ExecucaoMissao {
  return { passo: missao.inicio, escolhas: [], tentativasErradas: 0, concluida: false };
}
/** Uma escolha desconhecida não avança; conselho mantém o passo e nunca retira moedas. */
export function avancarMissao(missao: Missao, estado: ExecucaoMissao, escolha: string): ResultadoMissao {
  const inalterado = { estado, conselho: null, moedas: 0 };
  if (estado.concluida) return inalterado;
  const passo = missao.passos.find(p=>p.id===estado.passo);
  const opcao = passo?.opcoes.find(o=>o.id===escolha);
  if (!opcao) return inalterado;
  let anteriores=estado.escolhas;
  if(anteriores.length>=63) {
    // Conselhos antigos podem ser resumidos sem perder os cuidados já feitos.
    let atual=missao.inicio;const caminho:string[]=[];
    for(const id of anteriores){const o=missao.passos.find(p=>p.id===atual)?.opcoes.find(o=>o.id===id);if(o?.proximo && !o.conselho){caminho.push(id);atual=o.proximo}}
    anteriores=caminho;
  }
  const escolhas = [...anteriores, escolha];
  if (opcao.conselho) return { estado: { ...estado, escolhas, tentativasErradas: estado.tentativasErradas+1 }, conselho: opcao.conselho, moedas: 0 };
  const proximo = missao.passos.find(p=>p.id===opcao.proximo);
  if (!proximo) return inalterado;
  const concluida = proximo.final===true;
  return { estado: { ...estado, passo: proximo.id, escolhas, concluida }, conselho: null, moedas: concluida ? missao.recompensa : 0 };
}

/** Valida referências e caminhos; o catálogo falha cedo se um JSON estiver incompleto. */
export function validarMissao(valor: unknown): valor is Missao {
  if (!valor || typeof valor!=='object') return false;
  const m=valor as Missao;
  if (![m.id,m.titulo,m.valor,m.lugar,m.inicio].every(v=>typeof v==='string' && v.length>0) || !/^[a-z][a-z0-9-]*$/.test(m.id)) return false;
  if (!Number.isInteger(m.recompensa) || m.recompensa<=0 || m.recompensa>100 || !Array.isArray(m.personagens) || !m.personagens.every(p=>typeof p==='string')) return false;
  if (!Array.isArray(m.passos) || !m.passos.length || m.passos.some(p=>!p || typeof p.id!=='string' || typeof p.personagem!=='string' || typeof p.texto!=='string' || !Array.isArray(p.opcoes))) return false;
  if (new Set(m.passos.map(p=>p.id)).size!==m.passos.length || !m.passos.some(p=>p.id===m.inicio && !p.final)) return false;
  for(const p of m.passos) {
    if (p.final!==undefined && typeof p.final!=='boolean')return false;
    if (p.opcoes.some(o=>!o || typeof o!=='object'))return false;
    if (p.final ? p.opcoes.length!==0 : p.opcoes.length===0) return false;
    if (new Set(p.opcoes.map(o=>o.id)).size!==p.opcoes.length) return false;
    for(const o of p.opcoes) {
      if (typeof o.id!=='string' || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(o.id) || typeof o.texto!=='string')return false;
      const conselho=typeof o.conselho==='string' && o.conselho.trim().length>0 && o.proximo===undefined;
      const avanco=typeof o.proximo==='string' && m.passos.some(s=>s.id===o.proximo) && o.conselho===undefined;
      if(!conselho && !avanco)return false;
    }
  }
  const vistos=new Set<string>(), fila=[m.inicio]; let final=false;
  while(fila.length) { const id=fila.shift()!; if(vistos.has(id))continue; vistos.add(id); const p=m.passos.find(s=>s.id===id)!; final ||= !!p.final; for(const o of p.opcoes) if(o.proximo && !o.conselho)fila.push(o.proximo) }
  const abertos=new Set<string>(),fechados=new Set<string>();
  const semCiclo=(id:string,profundidade=0):boolean=>{
    if(abertos.has(id)||profundidade>63)return false;if(fechados.has(id))return true;
    abertos.add(id);const p=m.passos.find(p=>p.id===id)!;
    for(const o of p.opcoes)if(o.proximo&&!o.conselho&&!semCiclo(o.proximo,profundidade+1))return false;
    abertos.delete(id);fechados.add(id);return true;
  };
  return final && vistos.size===m.passos.length && semCiclo(m.inicio);
}
