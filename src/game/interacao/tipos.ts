export type TipoObjeto='pegavel'|'assento'|'cama'|'aparelho'|'recipiente'|'porta'|'agua';
export type PoseInteracao='em-pe'|'andando'|'sentado'|'deitado'|'dormindo'|'segurando'|'comendo'|'dancando'|'tomando-banho';
export interface Ponto {x:number;y:number}
export interface Snap extends Ponto {pose:'sentado'|'deitado';virado?:1|-1}
export interface DefinicaoObjeto {
  id:string;nome:string;tipo:TipoObjeto;sprite:Record<string,string>;origem:[number,number];largura:number;
  area:[number,number,number,number];pontoUso:[number,number];estadoInicial:Partial<EstadoObjeto>;
  snaps?:Snap[];capacidade?:number;aceita?:string[];destino?:string;comestivel?:boolean;bebivel?:boolean;
  particulas?:'gotas'|'vapor'|'bolhas';pose?:PoseInteracao;
}
export interface Trava {jogador:string;instancia:string;ate:number}
export interface Ocupante extends Trava {snap:number;dormindo?:boolean}
export interface EstadoObjeto {
  id:string;tipo:TipoObjeto;versao:number;local:'chao'|'mao'|'mochila'|'consumido';lugar:string;
  x:number;y:number;origem:Ponto;trava:Trava|null;ocupantes:Ocupante[];
  aberto:boolean;ligado:boolean;modo:number;itens:string[];mordidas:number;noite:boolean;
}
export type TipoAcao='tocar'|'pegar'|'soltar'|'guardar'|'retirar'|'comer'|'renovar'|'levantar'|'acao2'|'expirar';
export interface AcaoInteracao {tipo:TipoAcao;jogador:string;instancia:string;agora:number;versao?:number;ponto?:Ponto;snap?:number;item?:string;mochila?:boolean;definicao:DefinicaoObjeto}
export type EfeitoInteracao=
 |{tipo:'pose';pose:PoseInteracao;ponto?:Ponto;virado?:1|-1}
 |{tipo:'anim';nome:'toque'|'pegar'|'soltar'|'comer'|'abrir'|'fechar'|'ligar'|'desligar'}
 |{tipo:'particulas';nome:'gotas'|'vapor'|'bolhas'|'brilho'|'sono'|'coracoes'|'migalhas'}
 |{tipo:'fala';codigo:'ocupado'|'mudou'|'cheio'|'vazio'|'sem-posse'|'agua';jogador?:string}
 |{tipo:'porta';destino:string};
export interface ResultadoInteracao {estado:EstadoObjeto;efeitos:EfeitoInteracao[];aceita:boolean}
export interface PedidoInteracao {objeto:string;tipo:TipoAcao;versao:number;ponto?:Ponto;snap?:number;item?:string;mochila?:boolean}
export interface ConfirmacaoInteracao {aceita:boolean;estados:EstadoObjeto[];efeitos:EfeitoInteracao[]}
export interface TransporteInteracao {readonly usuario:string;readonly instancia:string;agora():number;ler():EstadoObjeto[];pedir(pedido:PedidoInteracao):Promise<ConfirmacaoInteracao>;observar(ouvinte:()=>void):()=>void;encerrar():void}
