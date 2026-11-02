export const IDS_COMODOS=['sala','cozinha','quarto','banheiro','quintal','lavanderia'] as const;
export type IdComodo=typeof IDS_COMODOS[number];
export interface InstanciaCasa {id:string;x:number;y:number;estadoInicial?:{aberto?:boolean;ligado?:boolean;modo?:number;itens?:string[]}}
export interface PortaCasa {destino:IdComodo;x:number;y:number;chegada:{x:number;y:number}}
export interface Comodo {id:IdComodo;nome:string;fundo:{parede:string;chao:string};entrada:{x:number;y:number};objetos:InstanciaCasa[];portas:PortaCasa[];adulto?:{nome:string;x:number;y:number}}
export function ehComodo(v:unknown):v is IdComodo{return IDS_COMODOS.includes(v as IdComodo)}
export function validarComodo(v:unknown,ids:readonly string[]):Comodo{
 const erro=():never=>{throw new Error('Cômodo inválido: confira fundo, objetos, portas e pontos de chegada.')};
 if(!v||typeof v!=='object')return erro();const c=v as Comodo;
 const ponto=(p:unknown):boolean=>!!p&&typeof p==='object'&&Number.isFinite((p as {x:number}).x)&&Number.isFinite((p as {y:number}).y)&&(p as {x:number}).x>=0&&(p as {x:number}).x<=1280&&(p as {y:number}).y>=0&&(p as {y:number}).y<=720;
 if(!ehComodo(c.id)||typeof c.nome!=='string'||!c.nome||!c.fundo||!/^#[a-fA-F0-9]{6}$/.test(c.fundo.parede)||!/^#[a-fA-F0-9]{6}$/.test(c.fundo.chao)||!ponto(c.entrada)||!Array.isArray(c.objetos)||!Array.isArray(c.portas))return erro();
 if(new Set(c.objetos.map(o=>o.id)).size!==c.objetos.length||c.objetos.some(o=>!ids.includes(o.id)||!ponto(o)))return erro();
 if(c.objetos.some(o=>o.estadoInicial&&(typeof o.estadoInicial!=='object'||Object.keys(o.estadoInicial).some(k=>!['aberto','ligado','modo','itens'].includes(k)))))return erro();
 if(c.adulto&&(!ponto(c.adulto)||typeof c.adulto.nome!=='string'))return erro();
 if(c.portas.some(p=>!ehComodo(p.destino)||p.destino===c.id||!ponto(p)||!ponto(p.chegada)))return erro();
 return c;
}
