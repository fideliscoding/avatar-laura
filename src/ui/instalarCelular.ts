import type Phaser from 'phaser';
import {supabase} from '../net/supabase';
import {Celular,type AtalhoCelular} from './Celular';
import {PainelAmigos} from './PainelAmigos';
import {amigos} from '../net/sala';
import {progresso,persistir} from '../game/estado';
import {sairDaConta,sessao} from '../net/sessao';
import {abrirPainelMissao} from '../scenes/CenaMissao';
interface Rotas{podeAbrir?:()=>boolean;personagens?:()=>AtalhoCelular[];mapa:()=>AtalhoCelular[];bloquear?:(aberto:boolean)=>void;focar?:(id:string)=>void}
export function instalarCelular(cena:Phaser.Scene,mundo:Phaser.Scene,rotas:Rotas):Celular{
 const painel=new PainelAmigos(cena,{frase:id=>{amigos.enviarFrase(id)},gesto:tipo=>{amigos.enviarAceno(tipo)},ver:id=>rotas.focar?.(id),fechar:()=>rotas.bloquear?.(false)});
 const celular=new Celular(cena,{
  podeAbrir:rotas.podeAbrir,saldo:()=>progresso.moedas,bloquear:rotas.bloquear,
  conteudo:app=>app==='Personagens'?[{nome:'Trocar cabelo',icone:'personagens',acao:()=>{persistir();mundo.scene.stop();cena.scene.start('Criador')}},...(rotas.personagens?.()??[])]:app==='Mapa'?rotas.mapa():app==='Moedas'?[{nome:'Meu diário',icone:'livro',acao:()=>abrirPainelMissao(mundo)}]:[],
  amigos:()=>{if(mundo.scene.key!=='Parque'){const ui=cena.scene.get('Interface');ui.events.once('create',()=>ui.events.emit('abrir-amigos'));mundo.scene.start('Parque');return}amigos.configurar(sessao.usuario,sessao.apelido);rotas.bloquear?.(true);painel.abrir()},
  sair:async()=>{await sairDaConta();if(!supabase){for(const s of cena.game.scene.getScenes(true))s.scene.stop();cena.game.scene.start('Entrar')}},
 });
 const abrirAmigos=()=>{amigos.configurar(sessao.usuario,sessao.apelido);rotas.bloquear?.(true);painel.abrir()};cena.events.on('abrir-amigos',abrirAmigos);
 const atualizar=()=>painel.atualizar();const redimensionar=()=>painel.reorganizar();cena.events.on('update',atualizar);cena.scale.on('resize',redimensionar);
 cena.events.once('shutdown',()=>{painel.destruir();cena.events.off('abrir-amigos',abrirAmigos);cena.events.off('update',atualizar);cena.scale.off('resize',redimensionar)});return celular;
}
