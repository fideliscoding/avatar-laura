export type Icone='celular'|'personagens'|'mapa'|'amigos'|'moedas'|'sair'|'voltar'|'confirmar'|'cancelar'|'mochila'|'livro'|'caixa'|'mao'|'agua'|'casa'|'olho'|'coracao'|'balanco'|'escorregador'|'gangorra'|'carrossel'|'sorvete'|'areia'|'banco'|'quarto'|'cozinha'|'banheiro'|'quintal'|'lavanderia'|'sala';
const formas:Record<Icone,string>={
 balanco:'<path d="M8 57 18 7h30l8 50M23 8v33m18-33v33"/><rect x="19" y="41" width="26" height="8" rx="3" fill="#f27ab3"/>',
 escorregador:'<path d="M8 55V15h22v12c0 18 15 23 26 23v7C31 57 23 42 23 26M8 27h14M8 38h14" fill="#d9c5ff"/>',
 gangorra:'<path d="m27 53 5-20 8 20z" fill="#b58cf5"/><path d="m7 21 50 20M9 14v15m46 5v15"/>',
 carrossel:'<ellipse cx="32" cy="47" rx="27" ry="10" fill="#f27ab3"/><path d="M32 47V15M17 40V25h30v15"/>',
 sorvete:'<path d="m20 30 12 29 12-29z" fill="#efbc83"/><circle cx="32" cy="22" r="17" fill="#f6afd4"/>',
 areia:'<path d="m10 26 6 29h24l6-29z" fill="#f27ab3"/><path d="M18 26V15c0-11 22-11 22 0v11M49 17l9-9m-9 9v22"/>',
 banco:'<rect x="8" y="13" width="48" height="22" rx="5" fill="#b58cf5"/><path d="M6 39h52M14 39v16m36-16v16"/>',
 quarto:'<path d="M7 55V20m0 18h50v17M8 37V26h48v12M14 26v-9h16v9" fill="#e8cfff"/>',
 cozinha:'<path d="M14 24h36v21c0 17-36 17-36 0zM7 31h7m36 0h7M12 18h40M32 18v-7" fill="#c6e8df"/>',
 banheiro:'<path d="M6 34h52M10 34v12c0 14 44 14 44 0V34M14 52v7m36-7v7M14 33V15c0-10 17-10 17 0" fill="#a8e3ec"/>',
 quintal:'<path d="M32 56V28M32 44c-18 2-22-7-20-14 15-2 21 5 20 14m0 1c18 2 22-7 20-14-15-2-21 5-20 14" fill="#a8dfb5"/><circle cx="32" cy="21" r="14" fill="#f6afd4"/><circle cx="32" cy="21" r="6" fill="#ffdd6f"/>',
 lavanderia:'<rect x="10" y="5" width="44" height="54" rx="6" fill="#dcc8f7"/><path d="M10 18h44M17 12h3m7 0h3"/><circle cx="32" cy="37" r="14" fill="#a8e3ec"/>',
 sala:'<path d="M9 39V20c0-15 46-15 46 0v19M5 31v19h54V31M13 50v9m38-9v9M12 36h40" fill="#d9c5ff"/>',

 celular:'<rect x="16" y="5" width="33" height="54" rx="9" fill="#d9c5ff"/><path d="M26 11h13M29 52h7"/><path d="m32 22 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#ffe18c"/>',
 personagens:'<circle cx="32" cy="21" r="12" fill="#ffdabf"/><path d="M12 57V45c0-18 40-18 40 0v12" fill="#b58cf5"/><path d="M20 21c-2-20 26-20 25 0"/>',
 mapa:'<path d="m6 15 17-7 18 8 17-7v41l-17 7-18-8-17 7z" fill="#d5f1dc"/><path d="M23 8v41m18-33v41"/><circle cx="39" cy="29" r="8" fill="#f27ab3"/><path d="m34 35 5 9 5-9" fill="#f27ab3"/>',
 amigos:'<circle cx="21" cy="23" r="10" fill="#ffdabf"/><circle cx="45" cy="23" r="10" fill="#eabb95"/><path d="M4 55v-9c0-16 30-16 30 0v9m-5-9c0-16 30-16 30 0v9" fill="#c8a3f2"/>',
 moedas:'<circle cx="32" cy="32" r="25" fill="#ffd23f"/><path d="m32 14 5 11 12 2-9 9 2 12-10-6-11 6 2-12-9-9 13-2z" fill="#fff1b5"/>',
 sair:'<path d="M29 7H9v50h20M39 17l15 15-15 15M22 32h31"/>',voltar:'<path d="M35 12 14 32l21 20M15 32h39"/>',confirmar:'<path d="m12 33 14 14 27-31"/>',cancelar:'<path d="m15 15 34 34M49 15 15 49"/>',
 mochila:'<path d="M22 19v-5q10-12 20 0v5"/><rect x="11" y="18" width="42" height="40" rx="12" fill="#d9c5ff"/><rect x="18" y="35" width="28" height="17" rx="6" fill="#f6afd4"/>',
 livro:'<path d="M32 14C20 6 9 10 6 13v40c9-6 19-5 26 0 8-5 19-6 26 0V13c-9-5-18-5-26 1v39" fill="#e6d3ff"/>',
 caixa:'<path d="m8 19 24-12 24 12v29L32 59 8 48zm0 0 24 13 24-13M32 32v27" fill="#e0c8ff"/>',
 mao:'<path d="M15 37V24a4 4 0 0 1 8 0v10-18a4 4 0 0 1 8 0v17-20a4 4 0 0 1 8 0v21-16a4 4 0 0 1 8 0v20l6-5c6-3 8 3 4 8L43 56H23L10 43c-4-5 1-10 5-6" fill="#ffdabf"/>',
 agua:'<path d="M32 6C20 23 10 33 15 46c7 18 35 13 36-2 1-11-11-26-19-38z" fill="#91dce6"/>',
 casa:'<path d="m5 29 27-23 27 23M13 25v32h38V25M26 57V39h13v18" fill="#edd6ff"/>',olho:'<path d="M4 32c16-25 40-25 56 0-16 25-40 25-56 0z" fill="#fff"/><circle cx="32" cy="32" r="9" fill="#b58cf5"/>',
 coracao:'<path d="M32 55 9 32C-5 10 21 1 32 19 43 1 69 10 55 32z" fill="#f27ab3"/>',
};
export function svgIcone(icone:Icone):string{return `<svg aria-hidden="true" focusable="false" viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="#5a2fa8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${formas[icone]}</svg>`}
export function iconePorNome(nome:string):Icone{
 for(const [nomeIcone,padrao] of [['balanco',/balanço/i],['escorregador',/escorregador/i],['gangorra',/gangorra/i],['carrossel',/carrossel/i],['sorvete',/sorvete/i],['areia',/areia/i],['banco',/banco/i],['quarto',/quarto|cama/i],['cozinha',/cozinha/i],['banheiro',/banheiro/i],['quintal',/quintal/i],['lavanderia',/lavanderia/i],['sala',/^sala$|sofá/i]] as const)if(padrao.test(nome))return nomeIcone;
 if(/^(Oi!|Tchau!)$|aceno/i.test(nome))return 'mao';if(/Obrigado|Muito bem/i.test(nome))return 'coracao';if(/Vamos brincar/i.test(nome))return 'amigos';
 if(/voltar|fechar/i.test(nome))return 'voltar';if(/confirmar|aprovar|entrar/i.test(nome))return 'confirmar';if(/sair|encerrar/i.test(nome))return 'sair';if(/mochila|guardar/i.test(nome))return 'mochila';if(/mapa|cidade|cômodos/i.test(nome))return 'mapa';if(/diário|missão/i.test(nome))return 'livro';if(/amig|frases|gestos|responsável/i.test(nome))return 'amigos';if(/água|bebedouro/i.test(nome))return 'agua';if(/comer|carinho|coração/i.test(nome))return 'coracao';if(/pegar|soltar|levantar|tocar/i.test(nome))return 'mao';return 'caixa';
}
export function botaoIcone(nome:string,acao:()=>void,icone:Icone=iconePorNome(nome),imagem?:string):HTMLButtonElement{
 const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',nome);b.dataset.icone=icone;b.style.cssText='box-sizing:border-box;min-width:64px;min-height:64px;border:3px solid #b58cf5;border-radius:20px;background:#eee0ff;cursor:pointer;touch-action:manipulation;display:inline-grid;place-items:center;padding:5px;';
 if(imagem){const img=document.createElement('img');img.src=imagem;img.alt='';img.style.cssText='width:54px;height:54px;object-fit:contain;pointer-events:none';b.append(img)}else b.innerHTML=svgIcone(icone);
 for(const evento of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend'])b.addEventListener(evento,e=>e.stopPropagation());
 b.addEventListener('click',acao);return b;
}
