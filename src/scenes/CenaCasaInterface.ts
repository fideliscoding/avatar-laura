import Phaser from 'phaser';
import type {CenaComodo} from './CenaComodo';
/** Controles em pixels do viewport, independentes do zoom do cômodo. */
export class CenaCasaInterface extends Phaser.Scene{
 private casa!:CenaComodo;
 constructor(){super('CasaInterface')}
 init(d:{casa:CenaComodo}):void{this.casa=d.casa}
 create():void{this.casa.criarInterface(this)}
}
