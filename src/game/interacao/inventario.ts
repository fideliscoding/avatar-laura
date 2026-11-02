export const CAPACIDADE_MOCHILA=6;
export interface Inventario {mao:string|null;mochila:string[]}
export const inventarioVazio=():Inventario=>({mao:null,mochila:[]});
export function pegarItem(inv:Inventario,item:string):{inventario:Inventario;solto:string|null}{
  if(inv.mao===item)return {inventario:inv,solto:null};
  const mochila=inv.mochila.filter(id=>id!==item);let solto:string|null=null;
  if(inv.mao){if(mochila.length<CAPACIDADE_MOCHILA)mochila.push(inv.mao);else solto=inv.mao}
  return {inventario:{mao:item,mochila},solto};
}
export function guardarMao(inv:Inventario):{inventario:Inventario;aceita:boolean}{
  if(!inv.mao || inv.mochila.length>=CAPACIDADE_MOCHILA)return {inventario:inv,aceita:false};
  return {inventario:{mao:null,mochila:[...inv.mochila.filter(i=>i!==inv.mao),inv.mao]},aceita:true};
}
export function removerItem(inv:Inventario,item:string):Inventario{return {mao:inv.mao===item?null:inv.mao,mochila:inv.mochila.filter(i=>i!==item)}}
export function inventarioValido(valor:unknown):valor is Inventario{
  if(!valor||typeof valor!=='object')return false;const v=valor as Inventario;
  return (v.mao===null||typeof v.mao==='string')&&Array.isArray(v.mochila)&&v.mochila.length<=6&&v.mochila.every(i=>typeof i==='string')&&new Set(v.mochila).size===v.mochila.length&&!v.mochila.includes(v.mao??'');
}
