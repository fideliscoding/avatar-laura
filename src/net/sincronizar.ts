import type { Progresso, Armazenamento } from '../game/estado';

export const IDS_CABELOS = ['liso', 'rabo', 'trancas', 'cacheado', 'coque', 'coquinhos'] as const;
export interface DadosNuvem { moedas: number; apelido: string; cabelo: string | null; concluidas: string[] }
export type Operacao = { id: string } & (
  { tipo: 'cabelo'; cabelo: number } |
  { tipo: 'missao'; missao: string; escolhas: string[] } |
  { tipo: 'concluir'; missao: string; escolhas: string[] }
);
export type NovaOperacao = Operacao extends infer O ? O extends Operacao ? Omit<O, 'id'> : never : never;
export interface PortaNuvem {
  carregar(): Promise<DadosNuvem>;
  executar(operacao: Operacao): Promise<number | null>;
}

/** Saldo oficial e conclusões vêm do servidor; somente ações pendentes da própria conta são mescladas. */
export function mesclar(local: Progresso, remoto: DadosNuvem, fila: Operacao[]): Progresso {
  const cabeloServidor = IDS_CABELOS.findIndex(id => id === remoto.cabelo);
  const cabelosPendentes = fila.filter((op): op is Operacao & { tipo: 'cabelo' } => op.tipo === 'cabelo');
  return {
    cabelo: cabelosPendentes[cabelosPendentes.length - 1]?.cabelo ?? (cabeloServidor >= 0 ? cabeloServidor : local.cabelo),
    moedas: remoto.moedas,
    missoesConcluidas: [...new Set([...remoto.concluidas, ...fila.filter(op => op.tipo === 'concluir').map(op => op.missao)])],
  };
}

function operacaoValida(valor: unknown): valor is Operacao {
  if (!valor || typeof valor !== 'object') return false;
  const op = valor as Partial<Operacao> & { cabelo?: unknown; missao?: unknown; escolhas?: unknown };
  if (typeof op.id !== 'string') return false;
  if (op.tipo === 'cabelo') return Number.isInteger(op.cabelo) && Number(op.cabelo) >= 0 && Number(op.cabelo) < 6;
  return (op.tipo === 'missao' || op.tipo === 'concluir') && op.missao === 'pedrinho-carrinho' &&
    Array.isArray(op.escolhas) && op.escolhas.every(e => e === 'A' || e === 'B' || e === 'C');
}

/** Fila durável por usuário; conserva a ordem e só remove uma ação após confirmação. */
export class FilaSincronizacao {
  readonly chave: string;
  private itens: Operacao[];
  private execucao: Promise<void> | null = null;
  private ativa = true;

  constructor(usuario: string, private arm: Armazenamento | null, private porta: PortaNuvem,
    private aoSaldo: (moedas: number) => void, private aoStatus: (pendente: boolean) => void) {
    this.chave = `mtmw:fila:v1:${usuario}`;
    try {
      const dados: unknown = JSON.parse(arm?.getItem(this.chave) ?? '[]');
      this.itens = Array.isArray(dados) ? dados.filter(operacaoValida) : [];
    } catch { this.itens = [] }
  }

  pendentes(): Operacao[] { return this.itens.map(op => ({ ...op })) }
  parar(): void { this.ativa = false }

  adicionar(op: NovaOperacao): void {
    this.itens.push({ ...op, id: crypto.randomUUID() });
    this.persistir();
    this.aoStatus(true);
    void this.enviar();
  }

  private persistir(): void {
    try { this.arm?.setItem(this.chave, JSON.stringify(this.itens)) } catch { /* A fila da sessão continua em memória. */ }
  }

  enviar(): Promise<void> {
    if (!this.ativa) return Promise.resolve();
    if (this.execucao) return this.execucao;
    this.execucao = this.processar().finally(() => { this.execucao = null });
    return this.execucao;
  }

  private async processar(): Promise<void> {
    while (this.ativa && this.itens.length) {
      const op = this.itens[0];
      try {
        const saldo = await this.porta.executar(op);
        // A sessão pode ter sido encerrada enquanto a requisição estava em andamento.
        if (!this.ativa) return;
        if (saldo !== null) this.aoSaldo(saldo);
        this.itens.shift(); this.persistir();
      } catch { if (this.ativa) this.aoStatus(true); return }
    }
    if (this.ativa) this.aoStatus(this.itens.length > 0);
  }
}
