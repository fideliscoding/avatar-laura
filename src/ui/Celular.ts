import type Phaser from 'phaser';
import {APPS_CELULAR,navegarCelular,type AppCelular,type EstadoCelular,type EventoCelular} from '../game/celular';
import {botaoIcone,svgIcone,type Icone} from './Icones';
export interface AtalhoCelular{nome:string;acao:()=>void;icone?:Icone;imagem?:string}
export interface OpcoesCelular{podeAbrir?:()=>boolean;conteudo:(app:AppCelular)=>AtalhoCelular[];saldo:()=>number;sair:()=>Promise<void>;amigos:()=>void;bloquear?:(aberto:boolean)=>void}
const ICONES:Record<AppCelular,Icone>={Personagens:'personagens',Mapa:'mapa',Amigos:'amigos',Moedas:'moedas',Sair:'sair'};
/** Única HUD do jogo. Os nomes são acessíveis, mas os controles só desenham ícones. */
export class Celular{
 readonly root=document.createElement('div');private elemento:Phaser.GameObjects.DOMElement;private estado:EstadoCelular={tela:'fechado'};private anterior?:HTMLElement;private enviando=false;
 constructor(private cena:Phaser.Scene,private opcoes:OpcoesCelular){
  this.root.dataset.celular='';this.root.style.cssText='position:relative;pointer-events:none;';
  for(const evento of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'])this.root.addEventListener(evento,e=>e.stopPropagation());
  this.elemento=cena.add.dom(0,0,this.root).setOrigin(0).setScrollFactor(0).setDepth(10000);this.elemento.pointerEvents='none';
  cena.events.on('update',this.atualizar,this);cena.events.on('pause',this.ocultar,this);cena.events.on('resume',this.mostrar,this);cena.scale.on('resize',this.reorganizar,this);cena.events.once('shutdown',this.destruir,this);this.renderizar();
 }
 get aberto():boolean{return this.estado.tela!=='fechado'}
 fechar():void{this.enviar({tipo:'fechar'})}
 abrir():void{if(this.opcoes.podeAbrir?.()===false)return;this.anterior=document.activeElement as HTMLElement;this.enviar({tipo:'abrir'})}
 private enviar(e:EventoCelular):void{const r=navegarCelular(this.estado,e);this.estado=r.estado;this.opcoes.bloquear?.(this.aberto);this.renderizar();if(r.sair&&!this.enviando){this.enviando=true;void this.opcoes.sair().catch(()=>{this.enviando=false;this.abrir()})}}
 private renderizar():void{
  this.root.replaceChildren();const botao=botaoIcone('Celular',()=>this.abrir(),'celular');botao.style.cssText+='position:absolute;right:12px;top:12px;pointer-events:auto;box-shadow:0 4px 0 #5a2fa8;';botao.setAttribute('aria-expanded',String(this.aberto));this.root.append(botao);
  if(!this.aberto){this.reorganizar();if(this.anterior?.isConnected)this.anterior.focus({preventScroll:true});else botao.focus({preventScroll:true});return}
  const fora=document.createElement('div');fora.dataset.foraCelular='';fora.style.cssText='position:absolute;inset:0;background:#2b1f4566;pointer-events:auto;';fora.addEventListener('click',()=>this.fechar());this.root.append(fora);
  const caixa=document.createElement('section');caixa.setAttribute('role','dialog');caixa.setAttribute('aria-modal','true');caixa.setAttribute('aria-label','Celular');caixa.tabIndex=-1;caixa.style.cssText='position:absolute;box-sizing:border-box;right:12px;bottom:12px;width:min(360px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;overscroll-behavior:contain;background:#f8f0ff;border:8px solid #8b55e6;border-radius:32px;padding:12px;pointer-events:auto;box-shadow:0 10px 30px #2b1f4566;';
  const voltar=botaoIcone('Voltar',()=>this.enviar({tipo:'voltar'}),'voltar');caixa.append(voltar);
  const grade=document.createElement('div');grade.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(64px,1fr));gap:14px;padding:12px 0;';caixa.append(grade);
  if(this.estado.tela==='inicio')for(const app of APPS_CELULAR)grade.append(botaoIcone(app,()=>{if(app==='Amigos'){this.fechar();this.opcoes.amigos()}else this.enviar({tipo:'app',app})},ICONES[app]));
  else if(this.estado.tela==='confirmar-saida'){
   const simbolo=document.createElement('div');simbolo.innerHTML=svgIcone('sair');simbolo.style.gridColumn='1 / -1';simbolo.style.textAlign='center';grade.append(simbolo);
   grade.append(botaoIcone('Cancelar saída',()=>this.enviar({tipo:'voltar'}),'cancelar'),botaoIcone('Confirmar saída',()=>this.enviar({tipo:'confirmar'}),'confirmar'));
  }else if(this.estado.tela==='app'){
   const app=this.estado.app;
   if(app==='Moedas'){const saldo=document.createElement('output');saldo.setAttribute('aria-label',`${this.opcoes.saldo()} moedas`);saldo.style.cssText='grid-column:1/-1;font:700 32px Fredoka,sans-serif;color:#5a2fa8;text-align:center;';saldo.innerHTML=svgIcone('moedas');const numero=document.createElement('span');numero.textContent=String(this.opcoes.saldo());saldo.append(numero);grade.append(saldo)}
   for(const item of new Map(this.opcoes.conteudo(app).map(item=>[item.nome,item])).values())grade.append(botaoIcone(item.nome,()=>{this.fechar();item.acao()},item.icone,item.imagem));
  }
  this.root.append(caixa);this.reorganizar();caixa.focus({preventScroll:true});caixa.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();this.fechar()}if(e.key==='Tab'){const botoes=[...caixa.querySelectorAll('button')];const primeiro=botoes[0],ultimo=botoes[botoes.length-1];if(e.shiftKey&&document.activeElement===primeiro){e.preventDefault();ultimo?.focus()}else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primeiro?.focus()}}});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)caixa.animate([{transform:'translateY(100%)',opacity:0},{transform:'translateY(-8px)',opacity:1,offset:.75},{transform:'translateY(0)',opacity:1}],{duration:330,easing:'ease-out'});
 }
 private atualizar():void{const visivel=this.opcoes.podeAbrir?.()!==false;this.elemento.setVisible(visivel);this.root.style.display=visivel?'block':'none';const saldo=this.root.querySelector('output');if(!saldo)return;const valor=String(this.opcoes.saldo());if(saldo.getAttribute('aria-label')!==`${valor} moedas`)saldo.setAttribute('aria-label',`${valor} moedas`);const numero=saldo.querySelector('span');if(numero&&numero.textContent!==valor)numero.textContent=valor}
 private ocultar():void{this.elemento.setVisible(false);this.root.style.display='none'}
 private mostrar():void{this.elemento.setVisible(true);this.root.style.display='block'}
 reorganizar():void{this.root.style.width=`${this.cena.scale.width}px`;this.root.style.height=`${this.cena.scale.height}px`;this.elemento.updateSize()}
 destruir():void{this.opcoes.bloquear?.(false);this.cena.scale.off('resize',this.reorganizar,this);this.cena.events.off('update',this.atualizar,this);this.cena.events.off('shutdown',this.destruir,this);this.cena.events.off('pause',this.ocultar,this);this.cena.events.off('resume',this.mostrar,this);this.elemento.destroy()}
}
