/** Medidas de interface em pixels visíveis; o mundo mantém suas coordenadas 1280x720. */
export function layoutParque(largura: number, altura: number, conta = false) {
  const retrato = largura < 600 && altura >= largura;
  const cabecalho = retrato ? (conta ? 162 : 112) : altura < 500 ? (largura < 700 ? 104 : 88) : 90;
  const rodape = altura < 500 ? 72 : 92;
  const alturaMundo = Math.max(100, altura - cabecalho - rodape);
  return { largura, altura, retrato, cabecalho, rodape, alturaMundo,
    zoom: Math.max(0.65, largura / 1280, alturaMundo / 720),
    porPagina: Math.max(1, Math.min(8, Math.floor((largura - 88) / 132))) };
}

export function layoutEntrada(largura: number, altura: number) {
  const curto = altura < 500;
  const empilhar = largura < 600 && !curto;
  const topoForm = curto ? 56 : Math.min(180, Math.max(112, altura * 0.22));
  const avisoY = altura - (empilhar ? 206 : curto ? 140 : 156);
  return { largura, altura, curto, empilhar, topoForm, avisoY,
    larguraForm: Math.min(440, largura - 32), alturaForm: Math.max(70, avisoY - topoForm - (curto ? 32 : 12)),
    tituloY: curto ? 20 : Math.max(32, topoForm - 108),
    acaoY: altura - (empilhar ? 148 : curto ? 86 : 108),
    alternarY: altura - (empilhar ? 92 : curto ? 86 : 108), offlineY: altura - 34 };
}
