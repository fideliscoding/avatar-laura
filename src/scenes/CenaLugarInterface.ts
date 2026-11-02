import Phaser from 'phaser';
import type {CenaLugar} from './CenaLugar';
import {instalarCelular} from '../ui/instalarCelular';
export class CenaLugarInterface extends Phaser.Scene{
 private lugar!:CenaLugar;
 constructor(){super('LugarInterface')}
 init(d:{lugar:CenaLugar}):void{this.lugar=d.lugar}
 create():void{instalarCelular(this,this.lugar,{mapa:()=>[{nome:this.lugar.scene.key==='Cidade'?'Parque':'Cidade',icone:'mapa',acao:()=>this.lugar.scene.start(this.lugar.scene.key==='Cidade'?'Parque':'Cidade')},...this.lugar.acoes().map(d=>({nome:d.nome,acao:()=>this.lugar.ir(d)}))]})}
}
