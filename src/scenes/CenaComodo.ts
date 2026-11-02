import Phaser from 'phaser';
import {nomePreparado} from '../game/casa/receitas';
import {COMODOS,CATALOGO_CASA,estadosIniciaisCasa} from '../game/casa/catalogo';
import {ehComodo,type IdComodo} from '../game/casa/comodos';
import {aplicarCasa} from '../game/casa/regras';
import {daInstancia,estadoEfetivo} from '../game/interacao/travas';
import {inventarioDoMundo} from '../game/interacao/mundo';
import type {PedidoInteracao} from '../game/interacao/tipos';
import {premiarCasa} from '../net/premiosCasa';
import {ObjetosSync} from '../net/objetosSync';
import {sessao} from '../net/sessao';
import {amigos} from '../net/sala';
import {CABELOS,FONTE} from '../config/assets';
import {TEXTOS_CASA as T} from '../config/casa';
import {progresso} from '../game/estado';
import {ObjetoInterativo} from './interacao/ObjetoInterativo';
import {Avatar} from './interacao/Avatar';
import {Efeitos} from './interacao/Efeitos';
import {AvatarAnimado} from '../ui/AvatarAnimado';
import {PainelCidade} from '../ui/PainelCidade';
import {criarTexturasCasa} from './casa/texturas';
/** A navegação troca só a apresentação; mundo e inventário permanecem vivos. */
export class CenaComodo extends Phaser.Scene{
 comodo:IdComodo='sala';transporte!:ObjetosSync;avatar!:Phaser.GameObjects.Image;
 private ui!:Phaser.Scene;private rig!:AvatarAnimado;private efeitos!:Efeitos;private adaptador!:Avatar;private visuais=new Map<string,ObjetoInterativo>();private nomes=new Map<string,Phaser.GameObjects.Text>();
 private fundo:Phaser.GameObjects.GameObject[]=[];private hud!:HTMLElement;private rodape!:HTMLElement;private doms:Phaser.GameObjects.DOMElement[]=[];private painel?:PainelCidade;private assinatura='';private selecionado='';private aviso!:HTMLElement;
 private x=640;private y=620;private tx=640;private ty=620;private chegada?:()=>void;private trocando=false;private comendo=0;private sombra!:Phaser.GameObjects.Rectangle;private cobertor!:Phaser.GameObjects.Rectangle;private flores!:Phaser.GameObjects.Graphics;private assentoBalanco!:Phaser.GameObjects.Image;
 constructor(chave='Casa'){super(chave)}
 init(dados:{comodo?:unknown}={}):void{this.comodo=ehComodo(dados.comodo)?dados.comodo:'sala'}
 create():void{
  this.assinatura='';this.visuais.clear();this.nomes.clear();this.fundo=[];this.doms=[];this.trocando=false;this.painel=undefined;
  this.transporte=new ObjetosSync(sessao.usuario,undefined,amigos,{lugar:'Casa',catalogo:CATALOGO_CASA,iniciais:estadosIniciaisCasa,aplicar:aplicarCasa,automaticos:(e,agora)=>e.filter(s=>s.prontoEm&&s.prontoEm<=agora).map(s=>({objeto:s.id,tipo:'acao2',versao:s.versao,comodo:s.comodo}))});
  this.efeitos=new Efeitos(this);criarTexturasCasa(this);
  this.avatar=this.add.image(640,620,CABELOS[progresso.cabelo].key).setOrigin(.5,1).setInteractive();this.avatar.setScale(172/this.avatar.height);this.rig=new AvatarAnimado(this.avatar);this.adaptador=new Avatar(this.avatar);
  this.avatar.on('pointerup',()=>{const item=this.inventario().mao;if(item)void this.solicitar(item,'comer')});
  for(const s of this.transporte.ler()){
   const d=CATALOGO_CASA.find(d=>d.id===s.id)!;const o=new ObjetoInterativo(this,d,s.x,s.y,()=>this.usar(s.id));this.visuais.set(s.id,o);
   this.nomes.set(s.id,this.add.text(s.x,s.y+16,d.nome,{fontFamily:FONTE,fontSize:'22px',color:'#5a2fa8',backgroundColor:'#fff9ff',padding:{x:6,y:3}}).setOrigin(.5).setDepth(s.y+3));
  }
  this.sombra=this.add.rectangle(0,0,1280,720,0x241238,.4).setOrigin(0).setDepth(5000);
  this.cobertor=this.add.rectangle(0,0,125,45,0xf2b7d8).setDepth(4900).setVisible(false);
  this.flores=this.add.graphics();this.assentoBalanco=this.add.image(260,330,'balanco-assento').setDisplaySize(70,20).setDepth(335);
  this.hud=undefined!;this.scene.launch('CasaInterface',{casa:this});this.scale.on('resize',this.ajustarCamera,this);
  this.events.once('shutdown',()=>{this.transporte.encerrar();amigos.pausar();this.scale.off('resize',this.ajustarCamera,this);this.painel?.destruir();this.scene.stop('CasaInterface');for(const d of this.doms)d.destroy()});
  amigos.configurar(sessao.usuario,sessao.apelido);
  const renovando=new Set<string>();const timer=setInterval(()=>{for(const s of this.transporte.ler())if((daInstancia(s.trava,this.transporte.usuario,this.transporte.instancia)||s.ocupantes.some(o=>daInstancia(o,this.transporte.usuario,this.transporte.instancia)))&&!renovando.has(s.id)){renovando.add(s.id);void this.solicitar(s.id,'renovar').finally(()=>renovando.delete(s.id))}},2000);this.events.once('shutdown',()=>clearInterval(timer));
 }
 criarInterface(ui:Phaser.Scene):void{
  this.ui=ui;
  this.hud=document.createElement('header');this.rodape=document.createElement('footer');
  for(const root of [this.hud,this.rodape]){root.style.cssText='box-sizing:border-box;padding:8px;background:#eee5fc;color:#5a2fa8;font:22px Fredoka,sans-serif;display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;';root.addEventListener('pointerdown',e=>e.stopPropagation());this.doms.push(this.ui.add.dom(0,0,root).setOrigin(.5,0).setScrollFactor(0).setDepth(9000))}
  this.botao(this.hud,T.cidade,()=>{this.scene.start('Cidade')});this.botao(this.hud,T.comodos,()=>this.minimapa());this.botao(this.hud,T.mochila,()=>this.mochila());
  this.aviso=document.createElement('div');this.aviso.setAttribute('role','status');this.aviso.style.cssText='width:100%;text-align:center;font-size:20px;';this.hud.append(this.aviso);this.montarComodo();this.ajustarCamera();
 }
 private botao(root:HTMLElement,texto:string,acao:()=>void):HTMLButtonElement{const b=document.createElement('button');b.type='button';b.textContent=texto;b.style.cssText='min-height:64px;min-width:64px;border:0;border-radius:15px;background:#8b55e6;color:white;padding:10px;font:600 22px Fredoka,sans-serif;touch-action:manipulation;';b.onclick=acao;root.append(b);return b}
 private ajustarCamera():void{
  if(!this.hud)return;const w=this.scale.width,h=this.scale.height;for(const root of [this.hud,this.rodape])root.style.width=`${w}px`;
  this.doms[0]?.updateSize().setPosition(w/2,0);this.doms[1]?.updateSize().setPosition(w/2,h-this.rodape.offsetHeight);
  const topo=this.hud.offsetHeight,baixo=this.rodape.offsetHeight;this.cameras.main.setViewport(0,topo,w,Math.max(100,h-topo-baixo)).setBounds(0,0,1280,720).setZoom(Math.max(.65,w/1280,(h-topo-baixo)/720)).startFollow(this.avatar,true,.2,.2,0,20);
 }
 private montarComodo():void{
  for(const o of this.fundo)o.destroy();this.fundo=[];const c=COMODOS.find(c=>c.id===this.comodo)!;
  this.fundo.push(this.add.rectangle(0,0,1280,720,Phaser.Display.Color.HexStringToColor(c.fundo.parede).color).setOrigin(0).setDepth(-20));
  const chao=this.add.rectangle(0,390,1280,330,Phaser.Display.Color.HexStringToColor(c.fundo.chao).color).setOrigin(0).setDepth(-19).setInteractive();
  chao.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(this.painel)return;const pt=this.cameras.main.getWorldPoint(p.x,p.y);this.levantar();this.andar(pt.x,pt.y,()=>{const id=this.inventario().mao;if(id)void this.solicitar(id,'soltar',{ponto:{x:this.x,y:this.y}})})});this.fundo.push(chao);
  if(c.adulto){const v=this.add.image(c.adulto.x,c.adulto.y,'vovo').setOrigin(.5,1).setDepth(c.adulto.y);v.setScale(150/v.height);this.fundo.push(v)}
  for(const p of c.portas){const d=COMODOS.find(c=>c.id===p.destino)!;const porta=this.add.rectangle(p.x,p.y,70,85,0xf1ccf5).setDepth(5).setStrokeStyle(3,0x8b55e6).setInteractive();const t=this.add.text(p.x,p.y-55,d.nome,{fontFamily:FONTE,fontSize:'22px',color:'#5a2fa8',backgroundColor:'#fff9ff'}).setOrigin(.5).setDepth(6);porta.on('pointerdown',(_p:unknown,_x:unknown,_y:unknown,e:Phaser.Types.Input.EventData)=>{e.stopPropagation();this.navegar(p.destino,p.chegada)});this.fundo.push(porta,t)}
  this.x=c.entrada.x;this.y=c.entrada.y;this.tx=this.x;this.ty=this.y;this.chegada=undefined;this.avatar.setPosition(this.x,this.y);this.aviso.textContent=c.nome;
  this.selecionado=c.objetos.find(o=>CATALOGO_CASA.find(d=>d.id===o.id)?.tipo!=='pegavel')?.id??'';this.atualizarRodape();this.assinatura='';
 }
 private atualizarRodape():void{
  this.rodape.replaceChildren();const select=document.createElement('select');select.setAttribute('aria-label',T.objetos);select.style.cssText='width:100%;min-height:56px;font:22px Fredoka,sans-serif;color:#5a2fa8;';
  for(const s of this.transporte.ler().filter(s=>s.comodo===this.comodo&&s.local==='chao')){const o=document.createElement('option');o.value=s.id;o.textContent=CATALOGO_CASA.find(d=>d.id===s.id)!.nome;select.append(o)}
  if([...select.options].some(o=>o.value===this.selecionado))select.value=this.selecionado;else this.selecionado=select.value;select.onchange=()=>{this.selecionado=select.value};this.rodape.append(select);
  this.botao(this.rodape,T.usar,()=>this.usar(this.selecionado));this.botao(this.rodape,T.opcoes,()=>this.opcoes(this.selecionado));this.botao(this.rodape,T.levantar,()=>this.levantar());this.ajustarCamera();
 }
 navegar(id:IdComodo,chegada?:{x:number;y:number}):void{
  if(this.trocando||id===this.comodo)return;this.fecharPainel();this.levantar();this.trocando=true;this.cameras.main.fadeOut(250,43,31,69);
  this.time.delayedCall(250,()=>{this.comodo=id;this.montarComodo();if(chegada){this.x=chegada.x;this.y=chegada.y;this.tx=this.x;this.ty=this.y}this.cameras.main.fadeIn(250,43,31,69);this.trocando=false});
 }
 private minimapa():void{const p=this.abrirPainel(T.comodos);for(const c of COMODOS)this.botao(p.root,c.nome,()=>this.navegar(c.id));this.botao(p.root,T.fechar,()=>this.fecharPainel());p.reorganizar()}
 private abrirPainel(titulo:string):PainelCidade{this.fecharPainel();return this.painel=new PainelCidade(this.ui,titulo)}
 private fecharPainel():void{if(this.painel){this.painel.destruir();this.painel=undefined;this.assinatura=''}}
 inventario(){return inventarioDoMundo(this.transporte.ler(),this.transporte.usuario,this.transporte.instancia,this.transporte.agora())}
 private mochila():void{const p=this.abrirPainel(T.mochila);const inv=this.inventario();p.texto(inv.mao?`${T.mao}: ${this.nome(inv.mao)}`:T.livre);if(inv.mao){for(const [texto,tipo] of [[T.guardar,'guardar'],[T.soltar,'soltar'],[T.comer,'comer']] as const)this.botao(p.root,texto,()=>{this.fecharPainel();void this.solicitar(inv.mao!,tipo,{ponto:{x:this.x,y:this.y}})})}p.texto(`${T.inventario}: ${inv.mochila.length}/6`);for(const id of inv.mochila)this.botao(p.root,this.nome(id),()=>{this.fecharPainel();void this.solicitar(id,'retirar')});this.botao(p.root,T.arrumar,()=>{this.fecharPainel();void this.solicitar('tapete','arrumar',{comodo:'sala'})});this.botao(p.root,T.fechar,()=>this.fecharPainel());p.reorganizar()}
 private nome(id:string):string{return nomePreparado(id,this.transporte.ler().find(s=>s.id===id)?.modo??0,CATALOGO_CASA.find(d=>d.id===id)?.nome??'')}
 private opcoes(id:string):void{
  const s=this.transporte.ler().find(s=>s.id===id);if(!s)return;const p=this.abrirPainel(this.nome(id));
  this.botao(p.root,T.tocar,()=>{this.fecharPainel();void this.solicitar(id,'tocar')});
  if(s.tipo==='cama')this.botao(p.root,T.dormir,()=>{this.fecharPainel();void this.solicitar(id,'tocar')});
  this.botao(p.root,T.segunda,()=>{this.fecharPainel();void this.solicitar(id,'acao2')});
  if(s.aberto||id==='escrivaninha'){for(const item of s.itens)this.botao(p.root,`${T.pegar} ${this.nome(item)}`,()=>{this.fecharPainel();void this.solicitar(id,'retirar',{item})});const item=this.inventario().mao;if(item)this.botao(p.root,T.colocar,()=>{this.fecharPainel();void this.solicitar(id,'guardar',{item})})}
  if(id==='guarda-roupa')for(const c of CABELOS)this.botao(p.root,c.nome,()=>{progresso.cabelo=CABELOS.indexOf(c);this.avatar.setTexture(c.key).setScale(172/this.avatar.height);this.fecharPainel()});
  this.botao(p.root,T.fechar,()=>this.fecharPainel());p.reorganizar();
 }
 usar(id:string):void{if(this.painel||this.trocando)return;const s=this.transporte.ler().find(s=>s.id===id);if(!s)return;this.selecionado=id;this.levantar();this.andar(s.x,s.y+60,()=>{void this.solicitar(id,'tocar').then(aceita=>{if(aceita&&s.tipo!=='pegavel')this.opcoes(id)})})}
 private andar(x:number,y:number,chegada?:()=>void):void{this.tx=Phaser.Math.Clamp(x,40,1240);this.ty=Phaser.Math.Clamp(y,250,690);this.chegada=chegada}
 private levantar():void{for(const s of this.transporte.ler())if(s.ocupantes.some(o=>daInstancia(o,this.transporte.usuario,this.transporte.instancia)))void this.solicitar(s.id,'levantar');this.avatar.setAngle(0).setOrigin(.5,1)}
 async solicitar(id:string,tipo:PedidoInteracao['tipo'],extra:Partial<PedidoInteracao>={}):Promise<boolean>{
  const s=this.transporte.ler().find(s=>s.id===id);if(!s)return false;
  const r=await this.transporte.pedir({objeto:id,tipo,versao:s.versao,comodo:this.comodo,mordidas:s.mordidas,ligado:!s.ligado,...extra});if(!this.scene.isActive())return false;
  if(!r.aceita){this.aviso.textContent=T.aguardar;return false}
  if(tipo==='renovar')return true;this.efeitos.tocar(this.visuais.get(id)!.imagem);this.efeitos.particulas(s.tipo==='agua'?'gotas':'brilho',s.x,s.y-80);
  for(const e of r.efeitos)if(e.tipo==='particulas')this.efeitos.particulas(e.nome,this.x,this.y-60);else if(e.tipo==='pose'&&e.pose==='comendo')this.comendo=this.time.now+700;
  if(tipo==='arrumar'){this.aviso.textContent=T.arrumada;void premiarCasa(this.transporte.dono,'arrumar').then(r=>{if(this.scene.isActive())this.aviso.textContent=r==='premiada'?T.premio:T.arrumada})}if(id==='ferro')this.aviso.textContent=T.adulto;if(id==='pia-banheiro'&&this.inventario().mao==='escova')this.aviso.textContent=T.escovar;this.assinatura='';return true;
 }
 update(time:number,delta:number):void{
  if(!this.transporte||!this.hud)return;const dx=this.tx-this.x,dy=this.ty-this.y,dist=Math.hypot(dx,dy),andando=dist>3;
  if(andando&&!this.painel){const passo=Math.min(dist,260*Math.min(.05,delta/1000));this.x+=dx/dist*passo;this.y+=dy/dist*passo}else if(!andando&&this.chegada){const c=this.chegada;this.chegada=undefined;c()}
  this.avatar.setOrigin(.5,1).setAngle(0).setPosition(this.x,this.y).setDepth(this.y);if(andando)this.avatar.setScale(Math.abs(this.avatar.scaleX)*(dx<0?-1:1),this.avatar.scaleY);
  const estados=this.transporte.ler().map(s=>estadoEfetivo(s,this.transporte.agora()));let pose:'andar'|'parada'|'sentar'|'dancar'=andando?'andar':'parada';this.cobertor.setVisible(false);
  for(const s of estados){const o=s.ocupantes.find(o=>daInstancia(o,this.transporte.usuario,this.transporte.instancia));if(o&&s.comodo===this.comodo){const d=CATALOGO_CASA.find(d=>d.id===s.id)!;const snap=d.snaps![o.snap];this.x=s.x+snap.x;this.y=s.y+snap.y+36;this.tx=this.x;this.ty=this.y;this.avatar.setPosition(this.x,this.y-36).setOrigin(.5,.79).setDepth(this.y);pose='sentar';if(s.id==='balanco-casa'){this.avatar.x+=Math.sin(time*.002)*22;this.avatar.y-=Math.cos(time*.004)*8;this.avatar.setAngle(Math.sin(time*.002)*6)}if(s.tipo==='cama'){this.avatar.setAngle(90);this.cobertor.setPosition(this.x,this.y-28).setDepth(this.y+3).setVisible(true);if(o.dormindo&&Math.floor(time/1000)%2===0)this.efeitos.particulas('sono',this.x,this.y-100)}}}
  this.adaptador.aplicarPose(time<this.comendo?'comendo':'em-pe');if(!andando&&estados.some(s=>s.id==='radio'&&s.comodo===this.comodo&&s.ligado&&Math.hypot(s.x-this.x,s.y-this.y)<300))pose='dancar';this.rig.atualizar(pose,time/1000);
  if(estados.some(s=>s.comodo===this.comodo&&s.ligado&&s.id==='chuveiro')&&time%700<delta)this.efeitos.particulas('vapor',this.x,this.y-70);
  for(const s of estados){const o=this.visuais.get(s.id)!,d=CATALOGO_CASA.find(d=>d.id===s.id)!;o.desenhar(s);const noChao=s.comodo===this.comodo&&s.local==='chao';o.imagem.setVisible(noChao).setTint(s.ligado?0xffed9f:0xffffff);if(s.aberto&&s.tipo==='recipiente')o.imagem.x+=20;if(s.id==='sanitario'&&s.aberto)o.imagem.setDisplaySize(170,170).setDepth(s.y+100).setAlpha(.85);else o.imagem.setAlpha(1);if(s.id==='tv'&&s.ligado)o.imagem.setTint([0xffe39f,0x8fdfe8,0xf4a6d3][s.modo]);o.zona.setVisible(noChao);if(o.zona.input)o.zona.input.enabled=noChao;this.nomes.get(s.id)!.setVisible(noChao).setText(this.nome(s.id)).setPosition(s.x,s.y+18).setDepth(s.y+3);
   if(s.local==='mao'&&daInstancia(s.trava,this.transporte.usuario,this.transporte.instancia)){const mao=this.adaptador.mao();o.imagem.setVisible(true).setPosition(mao.x,mao.y).setDisplaySize(32,32).setDepth(this.avatar.depth+1)}
   if(noChao&&s.ligado&&s.tipo==='agua'&&time%500<delta)this.efeitos.particulas(d.particulas??'gotas',s.x,s.y-90);
  }
  this.flores.clear();this.assentoBalanco.setVisible(this.comodo==='quintal');
  if(this.comodo==='quintal'){const c=estados.find(s=>s.id==='canteiro')!;if(c.aberto)for(let i=0;i<5;i++){const x=c.x-60+i*30,y=c.y-20;this.flores.lineStyle(4,0x5fa66d).lineBetween(x,y,x,y-15-c.modo*15);this.flores.fillStyle(c.modo===2?0xf27ab3:0x8cd197).fillCircle(x,y-20-c.modo*15,c.modo===2?12:6)}this.flores.setDepth(c.y+1)}
  this.sombra.setVisible(estados.some(s=>s.comodo===this.comodo&&((CATALOGO_CASA.find(d=>d.id===s.id)?.funcao==='luz'||s.id==='luz-quarto')&&!s.ligado||s.noite)));
  const assinatura=JSON.stringify(estados.map(s=>[s.id,s.local,s.comodo,s.itens,s.modo]));if(assinatura!==this.assinatura&&!this.painel){this.assinatura=assinatura;this.atualizarRodape()}
 }
}
