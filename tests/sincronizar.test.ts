import { describe, expect, it, vi } from 'vitest';
import { FilaSincronizacao, mesclar, type DadosNuvem, type PortaNuvem, type Operacao } from '../src/net/sincronizar';
import type { Armazenamento, Progresso } from '../src/game/estado';

const remoto: DadosNuvem = { moedas: 15, apelido: 'Estrela', cabelo: 'cacheado', concluidas: ['pedrinho-carrinho'] };
const local: Progresso = { moedas: 999, cabelo: 0, missoesConcluidas: ['inventada'] };
function memoria(): Armazenamento {
  const dados = new Map<string, string>();
  return { getItem: chave => dados.get(chave) ?? null, setItem: (chave, valor) => { dados.set(chave, valor) } };
}
function porta(executar = vi.fn<PortaNuvem['executar']>().mockResolvedValue(null)): PortaNuvem { return { carregar: vi.fn().mockResolvedValue(remoto), executar } }

describe('mescla com a nuvem', () => {
  it('sempre usa saldo oficial e não importa conquistas de outra conta ou do convidado', () => {
    expect(mesclar(local, remoto, [])).toEqual({ moedas: 15, cabelo: 3, missoesConcluidas: ['pedrinho-carrinho'] });
    expect(mesclar(local, { ...remoto, moedas: 0, concluidas: [] }, []).moedas).toBe(0);
    expect(local.moedas).toBe(999);
  });
  it('mantém cabelo e conclusão pendentes sem antecipar moedas', () => {
    const fila: Operacao[] = [{ id: '1', tipo: 'cabelo', cabelo: 5 }, { id: '2', tipo: 'concluir', missao: 'pedrinho-carrinho', escolhas: ['B'] }];
    expect(mesclar(local, { ...remoto, moedas: 0, concluidas: [] }, fila)).toEqual({ cabelo: 5, moedas: 0, missoesConcluidas: ['pedrinho-carrinho'] });
  });
});

describe('fila por conta', () => {
  it('persiste uma falha e retoma na ordem após recarregar', async () => {
    const arm = memoria(), executar = vi.fn<PortaNuvem['executar']>().mockRejectedValue(new Error('sem rede'));
    const primeira = new FilaSincronizacao('conta-a', arm, porta(executar), vi.fn(), vi.fn());
    primeira.adicionar({ tipo: 'missao', missao: 'pedrinho-carrinho', escolhas: ['A'] });
    primeira.adicionar({ tipo: 'concluir', missao: 'pedrinho-carrinho', escolhas: ['A','B'] });
    await primeira.enviar();
    expect(primeira.pendentes()).toHaveLength(2);
    primeira.parar();
    const saldo = vi.fn(), servidor = vi.fn<PortaNuvem['executar']>().mockResolvedValueOnce(null).mockResolvedValueOnce(15);
    const segunda = new FilaSincronizacao('conta-a', arm, porta(servidor), saldo, vi.fn());
    await segunda.enviar();
    expect(servidor.mock.calls.map(([op]) => op.tipo)).toEqual(['missao','concluir']);
    expect(saldo).toHaveBeenCalledWith(15);
    expect(segunda.pendentes()).toEqual([]);
    expect(JSON.parse(arm.getItem(segunda.chave)!)).toEqual([]);
  });
  it('não compartilha pendências entre usuários', async () => {
    const arm = memoria();
    const a = new FilaSincronizacao('a', arm, porta(vi.fn().mockRejectedValue('offline')), vi.fn(), vi.fn());
    a.adicionar({ tipo: 'cabelo', cabelo: 3 }); await a.enviar();
    const b = new FilaSincronizacao('b', arm, porta(), vi.fn(), vi.fn());
    expect(b.pendentes()).toEqual([]);
  });
  it('serializa o envio e inclui ações adicionadas durante uma requisição', async () => {
    let resolver!: (saldo: number | null) => void;
    const executar = vi.fn<PortaNuvem['executar']>().mockImplementationOnce(() => new Promise(r => { resolver = r })).mockResolvedValue(null);
    const fila = new FilaSincronizacao('a', memoria(), porta(executar), vi.fn(), vi.fn());
    fila.adicionar({ tipo: 'cabelo', cabelo: 1 });
    fila.adicionar({ tipo: 'cabelo', cabelo: 3 });
    const envio = fila.enviar();
    expect(executar).toHaveBeenCalledTimes(1);
    resolver(null); await envio;
    expect(executar).toHaveBeenCalledTimes(2);
    expect(fila.pendentes()).toEqual([]);
  });
  it('ignora respostas antigas depois de sair da conta e mantém a ação recuperável', async () => {
    let resolver!: (saldo: number | null) => void;
    const saldo = vi.fn(), arm = memoria();
    const executar = vi.fn<PortaNuvem['executar']>().mockImplementation(() => new Promise(r => { resolver = r }));
    const fila = new FilaSincronizacao('a', arm, porta(executar), saldo, vi.fn());
    fila.adicionar({ tipo: 'concluir', missao: 'pedrinho-carrinho', escolhas: ['B'] });
    const envio = fila.enviar(); fila.parar(); resolver(15); await envio;
    expect(saldo).not.toHaveBeenCalled();
    expect(JSON.parse(arm.getItem(fila.chave)!)).toHaveLength(1);
  });
  it('tolera armazenamento indisponível e descarta operações inválidas', () => {
    const fila = new FilaSincronizacao('a', { getItem: () => '[{"id":"x","tipo":"concluir","missao":"outra","escolhas":["B"]}]', setItem: vi.fn() }, porta(), vi.fn(), vi.fn());
    expect(fila.pendentes()).toEqual([]);
    expect(new FilaSincronizacao('b', null, porta(), vi.fn(), vi.fn()).pendentes()).toEqual([]);
  });
});
