import {describe,expect,it} from 'vitest';
import {validarComodo} from '../src/game/casa/comodos';
const c={id:'sala',nome:'Sala',fundo:{parede:'#ffffff',chao:'#eeeaff'},entrada:{x:640,y:600},objetos:[{id:'sofa',x:400,y:400}],portas:[{destino:'quarto',x:1200,y:500,chegada:{x:100,y:550}}]};
describe('carregador de cômodos',()=>{
 it('carrega fundo, objetos e chegada das portas',()=>{expect(validarComodo(c,['sofa'])).toEqual(c)});
 it.each([{...c,id:'rua'},{...c,objetos:[{...c.objetos[0],estadoInicial:{modo:Infinity}}]},{...c,objetos:[{id:'desconhecido',x:0,y:0}]},{...c,portas:[{...c.portas[0],chegada:{x:Infinity,y:1}}]},{...c,objetos:[c.objetos[0],c.objetos[0]]},{...c,fundo:{parede:'url(externa)',chao:'#ffffff'}}])('rejeita dados inválidos',v=>{expect(()=>validarComodo(v,['sofa'])).toThrow('Cômodo inválido')});
});
