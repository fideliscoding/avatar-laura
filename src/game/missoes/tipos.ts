export interface EscolhaMissao { id: string; texto: string; proximo?: string; conselho?: string }
export interface PassoMissao { id: string; personagem: string; texto: string; opcoes: EscolhaMissao[]; final?: boolean }
export interface Missao {
  id: string; titulo: string; valor: string; lugar: string; personagens: string[];
  recompensa: number; inicio: string; passos: PassoMissao[];
}
export interface ExecucaoMissao { passo: string; escolhas: string[]; tentativasErradas: number; concluida: boolean }
export interface ResultadoMissao { estado: ExecucaoMissao; conselho: string | null; moedas: number }
