import { describe, expect, it } from 'vitest';
import { FRASES, obterFrase } from '../src/game/frases';
import { acenoValido, deveEnviar, interpolar, normalizarCodigo, podeAprovar, validarEstadoRemoto } from '../src/game/regrasSala';

const estado = { x: 470, y: 640, cabelo: 'cacheado', estado: 'andar', angulo: 0, origemY: 1, sx: 1, sy: 1, z: 640 };
describe('comunicação somente por frases prontas', () => {
  it('aceita apenas os identificadores fixos e descarta qualquer texto ou formato livre', () => {
    for (const frase of FRASES) expect(obterFrase(frase.id)?.texto).toBe(frase.texto);
    for (const id of ['texto livre','<script>',null,undefined,{},'Oi!',0]) expect(obterFrase(id)).toBeNull();
    expect(acenoValido('coracao')).toBe(true); expect(acenoValido('aceno')).toBe(true); expect(acenoValido('pulo')).toBe(true);
    expect(acenoValido('mensagem')).toBe(false);
  });
});
describe('regras de sala', () => {
  it('normaliza código sem aceitar números ou textos extras', () => {
    expect(normalizarCodigo(' abcdef ')).toBe('ABCDEF');
    for (const codigo of ['ABC12F','ABCDE','ABCDEFG','ABC DEF','<teste>']) expect(normalizarCodigo(codigo)).toBeNull();
  });
  it('somente o dono aprova, com até seis contas e aprovação idempotente', () => {
    expect(podeAprovar(false,1)).toBe(false); expect(podeAprovar(true,5)).toBe(true);
    expect(podeAprovar(true,6)).toBe(false); expect(podeAprovar(true,6,true)).toBe(true);
  });
});
describe('movimentos remotos', () => {
  it('envia no máximo dez atualizações por segundo e somente quando mudou', () => {
    expect(deveEnviar(null,0,'a')).toBe(true);
    const ultimo={instante:100,assinatura:'a'};
    expect(deveEnviar(ultimo,150,'b')).toBe(false);
    expect(deveEnviar(ultimo,200,'a')).toBe(false);
    expect(deveEnviar(ultimo,200,'b')).toBe(true);
  });
  it('interpola suavemente, converge e independe da frequência de quadros', () => {
    const parcial=interpolar(0,100,1/60); expect(parcial).toBeGreaterThan(0); expect(parcial).toBeLessThan(100);
    let a=0,b=0;
    for(let i=0;i<60;i++)a=interpolar(a,100,1/60);
    for(let i=0;i<30;i++)b=interpolar(b,100,1/30);
    expect(a).toBeCloseTo(b,8); expect(a).toBeGreaterThan(99);
    expect(interpolar(50,100,0)).toBe(50);
  });
  it('rejeita coordenadas e poses malformadas e ignora identidade/texto enviados pelo cliente', () => {
    expect(validarEstadoRemoto({...estado,user_id:'outra-conta',apelido:'texto livre'})).toEqual(estado);
    for(const invalido of [{...estado,x:Infinity},{...estado,x:-20},{...estado,y:10000},{...estado,estado:'texto'},{...estado,cabelo:'inventado'},{...estado,cabelo:{toString:'invalido'}},{...estado,sx:1000},{...estado,origemY:-1},null]) expect(validarEstadoRemoto(invalido)).toBeNull();
  });
});
