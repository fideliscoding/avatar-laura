import Phaser from 'phaser';
import {PainelCidade} from '../ui/PainelCidade';
import {TEXTOS_INTERACAO as T} from '../config/interacoes';
import {definicaoObjeto} from '../game/interacao/catalogo';
import type {CenaParque} from './CenaParque';
export class CenaMochila extends Phaser.Scene {
 private parque!:CenaParque;private painel!:PainelCidade;private ultima='';
 constructor(){super('Mochila')}
 init(dados:{parque:CenaParque}):void{this.parque=dados.parque;this.ultima=''}
 create():void{
  this.add.rectangle(0,0,this.scale.width,this.scale.height,0x2b1f45,.6).setOrigin(0).setInteractive();
  this.painel=new PainelCidade(this,T.mochila);this.painel.root.style.fontSize='22px';this.mostrar();
 }
 private fechar():void{this.parque.scene.resume();this.scene.resume('Interface');this.scene.stop()}
 private botao(texto:string,acao:()=>void):void{const b=this.painel.botao(texto,acao);b.style.minHeight='64px';b.style.fontSize='22px'}
 private mostrar():void{
  const inv=this.parque.interacoes.inventario();const assinatura=JSON.stringify(inv);if(assinatura===this.ultima)return;this.ultima=assinatura;
  const p=this.painel;p.root.replaceChildren();p.texto(T.mochila,'h2');
  p.texto(inv.mao?`${T.mao}: ${definicaoObjeto(inv.mao).nome}`:T.vazia);
  if(inv.mao){this.botao(T.comer,()=>{this.fechar();this.parque.time.delayedCall(0,()=>this.parque.interacoes.comer())});this.botao(T.guardar,()=>{this.parque.interacoes.guardar();this.fechar()});this.botao(T.soltar,()=>{this.parque.interacoes.soltar();this.fechar()})}
  p.texto(`${T.espacos}: ${inv.mochila.length}/6`);
  for(const id of inv.mochila)this.botao(definicaoObjeto(id).nome,()=>{void this.parque.interacoes.solicitar(id,'retirar');this.fechar()});
  this.botao(T.levantar,()=>{this.parque.interacoes.levantar();this.fechar()});this.botao(T.fechar,()=>this.fechar());p.reorganizar();
 }
 update():void{this.mostrar()}
}
