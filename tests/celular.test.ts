import {describe,it,expect} from 'vitest';
import {APPS_CELULAR,navegarCelular} from '../src/game/celular';
describe('navegação do celular',()=>{
 it('oferece exatamente os cinco apps da primeira etapa',()=>{expect(APPS_CELULAR).toEqual(['Personagens','Mapa','Amigos','Moedas','Sair'])});
 it('exige confirmação de saída e não sai ao tocar fora',()=>{const r=navegarCelular({tela:'inicio'},{tipo:'app',app:'Sair'});expect(r.estado).toEqual({tela:'confirmar-saida'});expect(r.sair).toBe(false);expect(navegarCelular(r.estado,{tipo:'fechar'})).toEqual({estado:{tela:'fechado'},sair:false});expect(navegarCelular(r.estado,{tipo:'confirmar'}).sair).toBe(true);expect(navegarCelular({tela:'fechado'},{tipo:'confirmar'}).sair).toBe(false)});
 it('volta do app para a grade e da grade para o jogo',()=>{expect(navegarCelular({tela:'app',app:'Mapa'},{tipo:'voltar'}).estado).toEqual({tela:'inicio'});expect(navegarCelular({tela:'inicio'},{tipo:'voltar'}).estado).toEqual({tela:'fechado'})});
});
