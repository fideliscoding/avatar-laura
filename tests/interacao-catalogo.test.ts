import {describe,expect,it} from 'vitest';
import dados from '../public/assets/dados/objetos.json' with {type:'json'};
import {CATALOGO_OBJETOS,validarCatalogo,validarEstadoObjeto} from '../src/game/interacao/catalogo';
import {criarEstado} from '../src/game/interacao/regras';
describe('dados de objetos',()=>{
 it('carrega os três objetos e mantém áreas mínimas de 64',()=>{expect(CATALOGO_OBJETOS).toHaveLength(3);for(const d of CATALOGO_OBJETOS){expect(d.area[2]).toBeGreaterThanOrEqual(64);expect(d.area[3]).toBeGreaterThanOrEqual(64);expect(validarEstadoObjeto(criarEstado(d,'Parque',100,200),d)).toBe(true)}});
 it('explica campo ausente, área pequena e snaps inválidos',()=>{
  for(const alteracao of [{nome:undefined},{area:[0,0,30,30]},{snaps:[]},{estadoInicial:{trava:{jogador:'outro'}}}])expect(()=>validarCatalogo({versao:1,objetos:[{...dados.objetos[0],...alteracao}]})).toThrow('Catálogo de objetos inválido');
 });
 it('ignora cache/estado malformado antes de renderizar',()=>{const d=CATALOGO_OBJETOS[1],s=criarEstado(d,'Parque',100,200);for(const invalido of [null,{...s,x:Infinity},{...s,mordidas:9},{...s,local:'texto livre'},{...s,trava:{jogador:3}}])expect(validarEstadoObjeto(invalido,d)).toBe(false)});
});
