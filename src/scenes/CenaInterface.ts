import {IMAGENS} from '../config/assets';
import Phaser from 'phaser';
import {TEXTOS_INTERACAO as TI} from '../config/interacoes';
import {TEXTOS_CIDADE} from '../config/cidade';
import {MISSOES} from '../game/missoes/catalogo';
import {abrirPainelMissao} from './CenaMissao';
import {Dialogo} from '../ui/Dialogo';
import {instalarCelular} from '../ui/instalarCelular';
import type {CenaParque,Alvo} from './CenaParque';
const DESTINOS: { alvo: Alvo | 'cidade' | 'diario' | 'missao' | 'banco' | 'pegar-sorvete' | 'agua' | 'mochila' | 'levantar'; nome: string; missao?: string }[] = [
  { alvo: 'balanco', nome: 'Balanço' }, { alvo: 'escorregador', nome: 'Escorregador' },
  { alvo: 'gangorra', nome: 'Gangorra' }, { alvo: 'carrossel', nome: 'Carrossel' },
  { alvo: 'sorvete', nome: 'Sorvete' }, { alvo: 'vovo', nome: 'Dona Marta' },
  { alvo: 'pedro', nome: 'Pedrinho' }, { alvo: 'areia', nome: 'Areia' },
  ...MISSOES.filter(m=>m.lugar==='Parque' && m.id!=='pedrinho-carrinho').map(m=>({alvo:'missao' as const,nome:m.titulo,missao:m.id})), { alvo: 'cidade', nome: TEXTOS_CIDADE.mapa }, { alvo: 'diario', nome: TEXTOS_CIDADE.diario },
  {alvo:'banco',nome:TI.banco},{alvo:'pegar-sorvete',nome:TI.sorvete},{alvo:'agua',nome:TI.agua},{alvo:'mochila',nome:TI.mochila},{alvo:'levantar',nome:TI.levantar},
];

/** O celular substitui cabeçalho, saldo fixo e rodapé de atalhos. */
export class CenaInterface extends Phaser.Scene{
 dialogo!:Dialogo;private parque!:CenaParque;
 constructor(){super('Interface')}
 init(dados:{parque:CenaParque}):void{this.parque=dados.parque}
 create():void{
  this.dialogo=new Dialogo(this);this.parque.conectarInterface(this);
  instalarCelular(this,this.parque,{
   podeAbrir:()=>!this.dialogo.aberto,bloquear:aberto=>this.parque.bloquearSocial(aberto),focar:id=>this.parque.focarAmigo(id),
   personagens:()=>DESTINOS.filter(d=>['mochila','levantar'].includes(d.alvo)).map(d=>({nome:d.nome,acao:()=>this.executar(d)})),
   mapa:()=>DESTINOS.filter(d=>!['mochila','levantar','diario'].includes(d.alvo)).map(d=>({nome:d.nome,icone:d.alvo==='cidade'?'mapa' as const:undefined,imagem:d.alvo==='pedro'?import.meta.env.BASE_URL+IMAGENS['pedro-triste']:d.alvo==='vovo'?import.meta.env.BASE_URL+IMAGENS.vovo:undefined,acao:()=>this.executar(d)})),
  });
  const reorganizar=()=>this.dialogo.reorganizar();this.scale.on('resize',reorganizar);this.events.once('shutdown',()=>this.scale.off('resize',reorganizar));
 }
 private executar(item:typeof DESTINOS[number]):void{
  if(this.dialogo.aberto)return;
  if(item.alvo==='cidade')this.parque.scene.start('Cidade');
  else if(item.alvo==='diario')abrirPainelMissao(this.parque);
  else if(item.alvo==='missao'){if(item.missao==='parque-esperar')this.parque.conversarBia();else abrirPainelMissao(this.parque,item.missao)}
  else if(item.alvo==='banco')this.parque.interacoes.interagir('banco-parque');
  else if(item.alvo==='pegar-sorvete')this.parque.interacoes.interagir('sorvete-parque');
  else if(item.alvo==='agua')this.parque.interacoes.interagir('bebedouro-parque');
  else if(item.alvo==='levantar')this.parque.interacoes.levantar();
  else if(item.alvo==='mochila'){this.parque.scene.pause();this.scene.pause();this.scene.launch('Mochila',{parque:this.parque})}
  else this.parque.irPara(item.alvo);
 }
 notificarSocial(texto:string):void{const aviso=this.add.text(12,this.scale.height-72,texto,{fontFamily:'Fredoka',fontSize:'22px',color:'#5a2fa8',backgroundColor:'#fff',wordWrap:{width:this.scale.width-24}}).setDepth(7000);this.time.delayedCall(2600,()=>aviso.destroy())}
 definirObjetivo(_texto:string):void{}
}
