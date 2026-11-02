import Phaser from 'phaser';
import { TEXTOS_CIDADE as T } from '../config/cidade';
import { MISSOES, obterMissao } from '../game/missoes/catalogo';
import { avancarMissao, iniciarMissao } from '../game/missoes/motor';
import type { ExecucaoMissao, Missao } from '../game/missoes/tipos';
import { progresso, persistir, recompensarMissao } from '../game/estado';
import { sessao, registrar } from '../net/sessao';
import { PainelCidade } from '../ui/PainelCidade';

export function abrirPainelMissao(cena: Phaser.Scene, id?: string): void {
  if(cena.scene.isActive('Missao'))return;
  const origem=cena.scene.key;
  cena.scene.pause(); if(origem==='Parque')cena.scene.pause('Interface'); else cena.scene.pause('LugarInterface');
  cena.scene.launch('Missao',{origem,id});
}

export class CenaMissao extends Phaser.Scene {
  private origem=''; private missao?: Missao; private estado?: ExecucaoMissao; private painel!: PainelCidade;
  constructor(){super('Missao')}
  init(dados:{origem:string;id?:string}):void {this.origem=dados.origem;this.missao=dados.id?obterMissao(dados.id):undefined;this.estado=this.missao?iniciarMissao(this.missao):undefined}
  create():void {
    const fundo=this.add.rectangle(0,0,this.scale.width,this.scale.height,0x2b1f45,.62).setOrigin(0).setInteractive();
    const redimensionar=()=>fundo.setSize(this.scale.width,this.scale.height);
    this.scale.on('resize',redimensionar);this.events.once('shutdown',()=>this.scale.off('resize',redimensionar));
    this.painel=new PainelCidade(this,this.missao?.titulo??T.diario);this.mostrar();
  }
  private fechar():void {this.scene.resume(this.origem);this.scene.resume(this.origem==='Parque'?'Interface':'LugarInterface');this.scene.stop()}
  private mostrar(conselho?:string):void {
    const p=this.painel;p.root.replaceChildren();
    const fechar=p.botao(T.fechar,()=>this.fechar());fechar.style.position='sticky';fechar.style.top='0';fechar.style.zIndex='1';
    if(!this.missao || !this.estado) {
      p.texto(T.diario,'h2');
      for(const m of MISSOES) {
        const concluida=progresso.missoesConcluidas.includes(m.id);
        const card=document.createElement('article');card.style.cssText='background:#efe5ff;border-radius:16px;padding:14px;margin:12px 0';
        const titulo=document.createElement('h3');titulo.textContent=m.titulo;titulo.style.margin='0 0 8px';card.append(titulo);
        const descricao=document.createElement('p');descricao.textContent=`${m.valor} · ${m.lugar} · ${m.recompensa} moedas`;card.append(descricao);
        const selo=document.createElementNS('http://www.w3.org/2000/svg','svg');selo.setAttribute('viewBox','0 0 80 80');selo.setAttribute('width','54');selo.setAttribute('height','54');selo.setAttribute('aria-label',concluida?T.selo:T.pendente);
        const forma=document.createElementNS(selo.namespaceURI,'circle');forma.setAttribute('cx','40');forma.setAttribute('cy','40');forma.setAttribute('r','34');forma.setAttribute('fill',concluida?'#ffd23f':'#d9c5ff');selo.append(forma);
        if(concluida){const marca=document.createElementNS(selo.namespaceURI,'path');marca.setAttribute('d','M23 40 L35 52 L58 27');marca.setAttribute('fill','none');marca.setAttribute('stroke','#5a2fa8');marca.setAttribute('stroke-width','7');selo.append(marca)}
        card.append(selo);p.root.append(card);
      }
    } else {
      const m=this.missao,e=this.estado,passo=m.passos.find(p=>p.id===e.passo)!;
      p.texto(m.titulo,'h2');p.texto(`${m.valor} · ${m.recompensa} moedas`);p.texto(passo.personagem,'h3');p.texto(conselho??passo.texto);
      if(conselho)p.botao(T.tentar,()=>this.mostrar());
      else if(e.concluida) {p.texto(T.concluida);if(sessao.pendente)p.texto(T.avisoOffline);p.botao(T.repetir,()=>{this.estado=iniciarMissao(m);this.mostrar()})}
      else for(const o of passo.opcoes)p.botao(o.texto,()=>{
        const r=avancarMissao(m,this.estado!,o.id);this.estado=r.estado;
        if(r.estado.concluida){
          if(sessao.usuario){if(!progresso.missoesConcluidas.includes(m.id))progresso.missoesConcluidas.push(m.id);registrar({tipo:'concluir',missao:m.id,escolhas:r.estado.escolhas})}
          else Object.assign(progresso,recompensarMissao(progresso,m.id,r.moedas).progresso);
          persistir();
        } else registrar({tipo:'missao',missao:m.id,escolhas:r.estado.escolhas});
        this.mostrar(r.conselho??undefined);
      });
    }
    p.reorganizar();
  }
}
