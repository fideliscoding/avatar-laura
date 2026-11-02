import { describe, expect, it } from 'vitest';
import { MISSOES, obterMissao } from '../src/game/missoes/catalogo';
import { avancarMissao, iniciarMissao, validarMissao } from '../src/game/missoes/motor';
import { recompensarMissao } from '../src/game/estado';

describe('motor de missões por dados',()=>{
  it.each([
    ['pedrinho-carrinho',['ajudar','cavar','B'],15],['padaria-troco',['A','C','B'],10],['pet-bolinha',['agua','comida','carinho'],10],['parque-esperar',['C','B'],5],
  ] as const)('executa %s e paga somente na primeira conclusão',(id,escolhas,moedas)=>{
    const m=obterMissao(id);let estado=iniciarMissao(m),total=0;
    for(const escolha of escolhas){const r=avancarMissao(m,estado,escolha);estado=r.estado;total+=r.moedas}
    expect(estado.concluida).toBe(true);expect(total).toBe(moedas);
    expect(avancarMissao(m,estado,escolhas[0]).moedas).toBe(0);
    const salvo=recompensarMissao({cabelo:0,moedas:0,missoesConcluidas:[]},id,moedas).progresso;
    expect(recompensarMissao(salvo,id,moedas).moedas).toBe(0);
  });
  it('conselho mantém o passo, não pune e deixa tentar outra escolha',()=>{
    const m=obterMissao('padaria-troco'),inicio=iniciarMissao(m),r=avancarMissao(m,inicio,'A');
    expect(r.estado.passo).toBe(inicio.passo);expect(r.moedas).toBe(0);expect(r.conselho).toBeTruthy();
    expect(inicio.escolhas).toEqual([]);expect(avancarMissao(m,r.estado,'B').moedas).toBe(10);
  });
  it('continua permitindo tentar depois de muitos conselhos',()=>{
    const m=obterMissao('padaria-troco');let estado=iniciarMissao(m);
    for(let i=0;i<150;i++)estado=avancarMissao(m,estado,'A').estado;
    expect(estado.tentativasErradas).toBe(150);expect(avancarMissao(m,estado,'B').estado.concluida).toBe(true);
    expect(estado.escolhas.length).toBeLessThanOrEqual(64);
  });
  it('não permite pular cuidados nem executar eventos desconhecidos',()=>{
    const m=obterMissao('pet-bolinha'),s=iniciarMissao(m);
    for(const id of ['carinho','B','texto livre'])expect(avancarMissao(m,s,id).estado).toBe(s);
  });
  it('detecta JSON incompleto, referência quebrada e final inalcançável',()=>{
    expect(MISSOES.map(m=>m.id)).toEqual(expect.arrayContaining(['pedrinho-carrinho','padaria-troco','pet-bolinha','parque-esperar']));
    for(const m of MISSOES)expect(validarMissao(m)).toBe(true);
    for(const valor of [null,{}, {...obterMissao('pet-bolinha'),inicio:'inexistente'}, {...obterMissao('pet-bolinha'),passos:[]}, {...obterMissao('pet-bolinha'),passos:[{id:'agua',personagem:'Bolinha',texto:'Teste',opcoes:[null]}]}])expect(validarMissao(valor)).toBe(false);
  });
});
