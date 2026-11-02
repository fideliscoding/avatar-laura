import dados from '../../../public/assets/dados/casa-objetos.json' with {type:'json'};
import sala from '../../../public/assets/dados/comodos/sala.json' with {type:'json'};
import cozinha from '../../../public/assets/dados/comodos/cozinha.json' with {type:'json'};
import quarto from '../../../public/assets/dados/comodos/quarto.json' with {type:'json'};
import banheiro from '../../../public/assets/dados/comodos/banheiro.json' with {type:'json'};
import quintal from '../../../public/assets/dados/comodos/quintal.json' with {type:'json'};
import lavanderia from '../../../public/assets/dados/comodos/lavanderia.json' with {type:'json'};
import {validarCatalogo} from '../interacao/catalogo';
import {criarEstado} from '../interacao/regras';
import {validarComodo} from './comodos';
import type {DefinicaoObjeto,EstadoObjeto} from '../interacao/tipos';
export interface DefinicaoCasa extends DefinicaoObjeto{funcao:string}
export const CATALOGO_CASA=validarCatalogo(dados) as DefinicaoCasa[];
if(CATALOGO_CASA.some(d=>typeof d.funcao!=='string'||!d.funcao))throw new Error('Catálogo da casa inválido: funcao ausente.');
export const COMODOS=[sala,cozinha,quarto,banheiro,quintal,lavanderia].map(c=>validarComodo(c,CATALOGO_CASA.map(d=>d.id)));
const ids=COMODOS.flatMap(c=>c.objetos.map(o=>o.id));if(new Set(ids).size!==ids.length)throw new Error('Casa inválida: objeto repetido entre cômodos.');
export function estadosIniciaisCasa():EstadoObjeto[]{
 const guardados=new Set(CATALOGO_CASA.flatMap(d=>d.estadoInicial.itens??[]));
 return COMODOS.flatMap(c=>c.objetos.map(o=>({...criarEstado(CATALOGO_CASA.find(d=>d.id===o.id)!,'Casa',o.x,o.y),...o.estadoInicial,comodo:c.id,local:guardados.has(o.id)?'consumido' as const:'chao' as const})));
}
