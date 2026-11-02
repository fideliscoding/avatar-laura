import type {AcaoInteracao,DefinicaoObjeto,EfeitoInteracao,EstadoObjeto,ResultadoInteracao} from './tipos';
import {daInstancia,DURACAO_TRAVA,estadoEfetivo,pedirTrava} from './travas';
export function criarEstado(def:DefinicaoObjeto,lugar:string,x:number,y:number):EstadoObjeto{
  return {id:def.id,tipo:def.tipo,versao:0,local:'chao',lugar,x,y,origem:{x,y},trava:null,ocupantes:[],aberto:false,ligado:false,modo:0,itens:[],mordidas:0,noite:false,...def.estadoInicial};
}
/** O catálogo é confiável; a ação carrega somente IDs e pontos validados. Nunca recebe texto de fala. */
export function aplicarAcao(original:EstadoObjeto,acao:AcaoInteracao):ResultadoInteracao{
  const {definicao:d,jogador,instancia,agora,tipo}=acao;
  const s=estadoEfetivo(original,agora),efeitos:EfeitoInteracao[]=[];
  const negar=(codigo:'ocupado'|'mudou'|'cheio'|'vazio'|'sem-posse'):ResultadoInteracao=>({estado:original,aceita:false,efeitos:[{tipo:'fala',codigo,jogador:s.trava?.jogador??s.ocupantes[0]?.jogador}]});
  const concluir=(estado:EstadoObjeto):ResultadoInteracao=>({estado:{...estado,versao:original.versao+1},efeitos,aceita:true});
  if(d.id!==s.id||d.tipo!==s.tipo||!Number.isFinite(agora))return negar('mudou');
  if(tipo==='expirar')return s===original?{estado:original,efeitos,aceita:false}:concluir(s);
  if(acao.versao!==undefined && acao.versao!==s.versao && ['pegar','tocar','retirar'].includes(tipo) && ['pegavel','assento','cama'].includes(s.tipo))return negar('mudou');
  if(tipo==='renovar'){
    if(daInstancia(s.trava,jogador,instancia))return concluir({...s,trava:{jogador,instancia,ate:agora+DURACAO_TRAVA}});
    if(s.ocupantes.some(o=>daInstancia(o,jogador,instancia)))return concluir({...s,ocupantes:s.ocupantes.map(o=>daInstancia(o,jogador,instancia)?{...o,ate:agora+DURACAO_TRAVA}:o)});
    return negar('sem-posse');
  }
  efeitos.push({tipo:'anim',nome:'toque'});
  if(s.tipo==='pegavel'){
    if(s.local==='consumido')return negar('vazio');
    const possui=daInstancia(s.trava,jogador,instancia);
    if(tipo==='soltar'){
      if(!possui)return negar('sem-posse');const ponto=acao.ponto??s.origem;
      efeitos.push({tipo:'anim',nome:'soltar'},{tipo:'pose',pose:'em-pe'});
      return concluir({...s,local:'chao',x:ponto.x,y:ponto.y,origem:{...ponto},trava:null});
    }
    if(tipo==='comer'){
      if(!possui||s.local!=='mao')return negar('sem-posse');if(!d.comestivel&&!d.bebivel)return negar('vazio');
      const mordidas=Math.min(3,s.mordidas+1);efeitos.push({tipo:'pose',pose:'comendo'},{tipo:'particulas',nome:mordidas===3?'coracoes':'migalhas'});
      return concluir({...s,mordidas,local:mordidas===3?'consumido':'mao',trava:mordidas===3?null:s.trava});
    }
    if(tipo==='guardar'){
      if(!possui)return negar('sem-posse');return concluir({...s,local:'mochila'});
    }
    if(tipo==='pegar'||tipo==='retirar'||tipo==='tocar'){
      const trava=pedirTrava(s.trava,jogador,instancia,agora,s.versao,acao.versao??s.versao);if(!trava)return negar('ocupado');
      efeitos.push({tipo:'pose',pose:'segurando'},{tipo:'anim',nome:'pegar'});return concluir({...s,local:acao.mochila?'mochila':'mao',trava});
    }
    return negar('sem-posse');
  }
  if(s.tipo==='assento'||s.tipo==='cama'){
    const proprio=s.ocupantes.find(o=>daInstancia(o,jogador,instancia));
    if(tipo==='levantar'||(tipo==='tocar'&&proprio&&s.tipo==='assento')){
      if(!proprio)return negar('sem-posse');efeitos.push({tipo:'pose',pose:'em-pe'});return concluir({...s,ocupantes:s.ocupantes.filter(o=>o!==proprio),noite:false});
    }
    if(tipo!=='tocar')return negar('sem-posse');
    if(proprio&&s.tipo==='cama'){
      efeitos.push({tipo:'pose',pose:'dormindo'},{tipo:'particulas',nome:'sono'});
      return concluir({...s,noite:true,ocupantes:s.ocupantes.map(o=>o===proprio?{...o,dormindo:true,ate:agora+DURACAO_TRAVA}:o)});
    }
    const snap=acao.snap??d.snaps?.findIndex((_p,i)=>!s.ocupantes.some(o=>o.snap===i));
    if(snap===undefined||snap<0||!d.snaps?.[snap]||s.ocupantes.some(o=>o.snap===snap))return negar('ocupado');
    const ponto=d.snaps[snap];efeitos.push({tipo:'pose',pose:ponto.pose==='sentado'?'sentado':'deitado',ponto,virado:ponto.virado});
    return concluir({...s,ocupantes:[...s.ocupantes,{jogador,instancia,ate:agora+DURACAO_TRAVA,snap}]});
  }
  if(s.tipo==='aparelho'||s.tipo==='agua'){
    if(tipo==='acao2'&&s.tipo==='aparelho')return concluir({...s,modo:(s.modo+1)%3});
    if(tipo!=='tocar')return negar('sem-posse');const ligado=acao.ligado??!s.ligado;efeitos.push({tipo:'anim',nome:ligado?'ligar':'desligar'});
    if(ligado&&s.tipo==='agua')efeitos.push({tipo:'particulas',nome:d.particulas??'gotas'},{tipo:'pose',pose:d.pose??'em-pe'},{tipo:'fala',codigo:'agua'});
    return concluir({...s,ligado});
  }
  if(s.tipo==='recipiente'){
    if(tipo==='tocar'){efeitos.push({tipo:'anim',nome:s.aberto?'fechar':'abrir'});return concluir({...s,aberto:!s.aberto})}
    if(!s.aberto||!acao.item)return negar('vazio');
    if(tipo==='guardar'){
      if(s.itens.length>=(d.capacidade??6)||(d.aceita&&!d.aceita.includes(acao.item)))return negar('cheio');
      return concluir({...s,itens:[...s.itens.filter(id=>id!==acao.item),acao.item]});
    }
    if(tipo==='retirar'&&s.itens.includes(acao.item))return concluir({...s,itens:s.itens.filter(id=>id!==acao.item)});
    return negar('vazio');
  }
  if(s.tipo==='porta'&&tipo==='tocar'&&d.destino){efeitos.push({tipo:'porta',destino:d.destino});return concluir({...s,aberto:true})}
  return negar('sem-posse');
}
