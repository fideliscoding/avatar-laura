import Phaser from 'phaser';
import {COMODOS} from '../game/casa/catalogo';
import {ehComodo,type IdComodo} from '../game/casa/comodos';
/** Cena reutilizável: os seis ambientes vêm do mesmo formato de dados. */
export class CenaComodo extends Phaser.Scene{
 comodo:IdComodo='sala';
 constructor(chave='Casa'){super(chave)}
 init(dados:{comodo?:unknown}={}):void{this.comodo=ehComodo(dados.comodo)?dados.comodo:'sala'}
 create():void{
  const dados=COMODOS.find(c=>c.id===this.comodo)!;
  this.add.rectangle(0,0,1280,720,Number(dados.fundo.parede.replace('#','0x'))).setOrigin(0);
  this.add.rectangle(0,400,1280,320,Number(dados.fundo.chao.replace('#','0x'))).setOrigin(0);
 }
}
