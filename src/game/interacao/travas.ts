import type {EstadoObjeto,Trava} from './tipos';
export const DURACAO_TRAVA=8000;
export function travaAtiva(trava:Trava|null,agora:number):boolean{return !!trava && trava.ate>agora}
export function daInstancia(trava:Trava|null,jogador:string,instancia:string):boolean{return !!trava && trava.jogador===jogador && trava.instancia===instancia}
export function pedirTrava(atual:Trava|null,jogador:string,instancia:string,agora:number,versao:number,esperada:number):Trava|null{
  if(versao!==esperada || (travaAtiva(atual,agora)&&!daInstancia(atual,jogador,instancia)))return null;
  return {jogador,instancia,ate:agora+DURACAO_TRAVA};
}
/** A expiração é também projetada pelos leitores, mesmo se a autoridade desconectar. */
export function estadoEfetivo(estado:EstadoObjeto,agora:number):EstadoObjeto{
  const expirou=!!estado.trava&&!travaAtiva(estado.trava,agora);
  const ocupantes=estado.ocupantes.filter(o=>o.ate>agora);
  if(!expirou && ocupantes.length===estado.ocupantes.length)return estado;
  return {...estado,trava:expirou?null:estado.trava,local:expirou?'chao':estado.local,
    x:expirou?estado.origem.x:estado.x,y:expirou?estado.origem.y:estado.y,ocupantes,noite:ocupantes.some(o=>o.dormindo)};
}
