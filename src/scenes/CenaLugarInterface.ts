import Phaser from 'phaser';
import { Botao } from '../ui/Botao';
import { CORES, FONTE } from '../config/assets';
import { TEXTOS_CIDADE as T } from '../config/cidade';
import { progresso } from '../game/estado';
import { CenaLugar } from './CenaLugar';
import { abrirPainelMissao } from './CenaMissao';

export class CenaLugarInterface extends Phaser.Scene {
  private lugar!:CenaLugar;private hud?:Phaser.GameObjects.Container;private moedas?:Phaser.GameObjects.Text;private pagina=0;
  constructor(){super('LugarInterface')}
  init(dados:{lugar:CenaLugar}):void{this.lugar=dados.lugar;this.pagina=0}
  create():void{this.montar();this.scale.on('resize',this.montar,this);this.events.once('shutdown',()=>this.scale.off('resize',this.montar,this))}
  private montar():void{
    this.hud?.destroy(true);this.hud=this.add.container();const w=this.scale.width,h=this.scale.height;
    const g=this.add.graphics();g.fillStyle(0xf4edff);g.fillRect(0,0,w,88);g.fillStyle(0xffffff);g.fillRect(0,h-88,w,88);this.hud.add(g);
    this.hud.add(new Botao(this,65,27,this.lugar.scene.key==='Cidade'?T.parque:'Cidade',()=>this.lugar.scene.start(this.lugar.scene.key==='Cidade'?'Parque':'Cidade'),{largura:110,tamanho:16}));
    this.hud.add(new Botao(this,w-82,27,T.diario,()=>abrirPainelMissao(this.lugar),{largura:140,tamanho:16}));
    this.hud.add(this.add.text(16,60,this.lugar.titulo(),{fontFamily:FONTE,fontSize:'18px',color:CORES.textoRoxo}));
    this.moedas=this.add.text(w-16,60,`${progresso.moedas} moedas`,{fontFamily:FONTE,fontSize:'18px',color:CORES.textoRoxo}).setOrigin(1,0);this.hud.add(this.moedas);
    const todos=this.lugar.acoes(),porPagina=w<700?2:4,paginas=Math.max(1,Math.ceil(todos.length/porPagina));this.pagina%=paginas;
    if(paginas>1){this.hud.add(new Botao(this,23,h-39,'<',()=>{this.pagina=(this.pagina-1+paginas)%paginas;this.montar()},{largura:44,tamanho:18}));this.hud.add(new Botao(this,w-23,h-39,'>',()=>{this.pagina=(this.pagina+1)%paginas;this.montar()},{largura:44,tamanho:18}))}
    const itens=todos.slice(this.pagina*porPagina,(this.pagina+1)*porPagina),margem=paginas>1?52:12,passo=(w-2*margem)/Math.max(1,itens.length);
    itens.forEach((destino,i)=>this.hud!.add(new Botao(this,margem+passo*(i+.5),h-39,destino.nome,()=>this.lugar.ir(destino),{largura:passo-8,tamanho:w<380?14:16})));
  }
  update():void{this.moedas?.setText(`${progresso.moedas} moedas`)}
}
