import dados from '../../../public/assets/dados/receitas.json' with {type:'json'};
export interface Receita{aparelho:string;item:string;requer?:string;resultado:string;tempo:number;modoResultado:number}
export const RECEITAS:Receita[]=dados;
export function receitaPara(aparelho:string,item:string):Receita|undefined{return RECEITAS.find(r=>r.aparelho===aparelho&&r.item===item)}
export function nomePreparado(id:string,modo:number,nome:string):string{return modo>0?RECEITAS.find(r=>r.item===id&&r.modoResultado===modo)?.resultado??nome:nome}
