import dados from '../../../public/assets/dados/objetos.json' with {type:'json'};
import parque from '../../../public/assets/dados/comodos/parque.json' with {type:'json'};
import type {DefinicaoObjeto,EstadoObjeto,TipoObjeto} from './tipos';
const TIPOS:TipoObjeto[]=['pegavel','assento','cama','aparelho','recipiente','porta','agua'];
const idValido=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9-]{0,79}$/.test(v);
const numeros=(v:unknown,tamanho:number):v is number[]=>Array.isArray(v)&&v.length===tamanho&&v.every(n=>typeof n==='number'&&Number.isFinite(n));
export function validarCatalogo(valor:unknown):DefinicaoObjeto[]{
 const falha=(campo:string):never=>{throw new Error(`Catálogo de objetos inválido: ${campo}.`)};
 if(!valor||typeof valor!=='object')return falha('objeto raiz');
 const raiz=valor as {versao?:unknown;objetos?:unknown};
 if(raiz.versao!==1||!Array.isArray(raiz.objetos))return falha('versao ou objetos');
 const ids=new Set<string>();
 for(const item of raiz.objetos){
  if(!item||typeof item!=='object')return falha('objeto');const d=item as DefinicaoObjeto;
  if(!idValido(d.id)||ids.has(d.id))return falha('id ausente ou repetido');ids.add(d.id);
  if(typeof d.nome!=='string'||!d.nome.trim()||!TIPOS.includes(d.tipo))return falha(`${d.id}: nome ou tipo`);
  if(!d.sprite||typeof d.sprite!=='object'||Array.isArray(d.sprite)||!Object.keys(d.sprite).length||!Object.values(d.sprite).every(idValido))return falha(`${d.id}: sprite`);
  if(!numeros(d.origem,2)||d.origem.some(n=>n<0||n>1)||!numeros(d.area,4)||d.area[2]<64||d.area[3]<64||!numeros(d.pontoUso,2)||!Number.isFinite(d.largura)||d.largura<=0)return falha(`${d.id}: origem, area, largura ou pontoUso`);
  if(!d.estadoInicial||typeof d.estadoInicial!=='object'||Array.isArray(d.estadoInicial))return falha(`${d.id}: estadoInicial`);
  if(Object.keys(d.estadoInicial).some(k=>!['aberto','ligado','modo','itens','mordidas','noite'].includes(k)))return falha(`${d.id}: campo inicial reservado`);
  if(['assento','cama'].includes(d.tipo)&&(!Array.isArray(d.snaps)||!d.snaps.length||d.snaps.some(s=>!s||!Number.isFinite(s.x)||!Number.isFinite(s.y)||!['sentado','deitado'].includes(s.pose))))return falha(`${d.id}: snaps`);
  if(d.tipo==='porta'&&(typeof d.destino!=='string'||!d.destino))return falha(`${d.id}: destino`);
  if(d.capacidade!==undefined&&(!Number.isInteger(d.capacidade)||d.capacidade<1||d.capacidade>6))return falha(`${d.id}: capacidade`);
 }
 return raiz.objetos as DefinicaoObjeto[];
}
export const CATALOGO_OBJETOS=validarCatalogo(dados);
export const OBJETOS_PARQUE=parque.objetos;
export function definicaoObjeto(id:string):DefinicaoObjeto{const d=CATALOGO_OBJETOS.find(d=>d.id===id);if(!d)throw new Error('Objeto não cadastrado.');return d}
/** Reconstrói só os campos conhecidos do estado; dados de rede nunca viram texto ou textura. */
export function validarEstadoObjeto(valor:unknown,def:DefinicaoObjeto):valor is EstadoObjeto{
 if(!valor||typeof valor!=='object')return false;const s=valor as EstadoObjeto;
 const ponto=(p:unknown):boolean=>!!p&&typeof p==='object'&&Number.isFinite((p as {x:number}).x)&&Number.isFinite((p as {y:number}).y);
 const trava=(t:unknown):boolean=>!!t&&typeof t==='object'&&typeof (t as {jogador:string}).jogador==='string'&&typeof (t as {instancia:string}).instancia==='string'&&Number.isFinite((t as {ate:number}).ate);
 return s.id===def.id&&s.tipo===def.tipo&&Number.isInteger(s.versao)&&s.versao>=0&&['chao','mao','mochila','consumido'].includes(s.local)&&typeof s.lugar==='string'&&Number.isFinite(s.x)&&s.x>=0&&s.x<=1280&&Number.isFinite(s.y)&&s.y>=0&&s.y<=720&&ponto(s.origem)&&(s.trava===null||trava(s.trava))&&Array.isArray(s.ocupantes)&&s.ocupantes.length<=(def.snaps?.length??0)&&s.ocupantes.every(o=>trava(o)&&Number.isInteger(o.snap)&&o.snap>=0&&o.snap<(def.snaps?.length??0))&&['aberto','ligado','noite'].every(k=>typeof (s as unknown as Record<string,unknown>)[k]==='boolean')&&Number.isInteger(s.modo)&&s.modo>=0&&s.modo<=2&&Number.isInteger(s.mordidas)&&s.mordidas>=0&&s.mordidas<=3&&Array.isArray(s.itens)&&s.itens.length<=6&&s.itens.every(idValido);
}
