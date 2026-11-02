import {CATALOGO_CASA,estadosIniciaisCasa} from '../game/casa/catalogo';
import {aplicarCasa} from '../game/casa/regras';
import type {MundoObjetos} from './objetosSync';
export const MUNDO_CASA:MundoObjetos={
 lugar:'Casa',catalogo:CATALOGO_CASA,iniciais:estadosIniciaisCasa,aplicar:aplicarCasa,
 automaticos:(estados,agora)=>estados.filter(s=>s.prontoEm&&s.prontoEm<=agora).map(s=>({objeto:s.id,tipo:'acao2',versao:s.versao,comodo:s.comodo})),
};
