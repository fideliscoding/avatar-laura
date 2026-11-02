import {supabase} from './supabase';
import {persistir,progresso} from '../game/estado';
export type PremioCasa='arrumar'|'tapete'|'estrelas'|'patinho';
/** A nuvem concede um valor fixo. Offline sem conta tem ledger próprio, nunca importado para contas. */
export async function premiarCasa(dono:string,evento:PremioCasa):Promise<'premiada'|'repetida'|'pendente'>{
 if(supabase&&dono!=='local'){
  try{const r=await supabase.rpc('recompensar_casa',{p_dono:dono,p_evento:evento});if(r.error)return 'pendente';const v=r.data as {moedas?:unknown;premiada?:unknown};if(!Number.isInteger(v.moedas)||Number(v.moedas)<0||typeof v.premiada!=='boolean')return 'pendente';progresso.moedas=Number(v.moedas);persistir();return v.premiada?'premiada':'repetida'}catch{return 'pendente'}
 }
 const dia=evento==='arrumar'?new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date()):'unica';const chave=`mtmw:premios-casa:v1:local:${evento}:${dia}`;
 try{if(localStorage.getItem(chave))return 'repetida';localStorage.setItem(chave,'1');progresso.moedas++;persistir();return 'premiada'}catch{return 'pendente'}
}
