import Phaser from 'phaser';
import {instalarCelular} from '../ui/instalarCelular';
export class CenaCriadorInterface extends Phaser.Scene{
 constructor(){super('CriadorInterface')}
 create():void{const criador=this.scene.get('Criador');instalarCelular(this,criador,{mapa:()=>[{nome:'Ir para o parque',icone:'casa',acao:()=>criador.scene.start('Parque')},{nome:'Mapa da cidade',icone:'mapa',acao:()=>criador.scene.start('Cidade')}]})}
}
