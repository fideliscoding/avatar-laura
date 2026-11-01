const BLOQUEADAS = ['merda', 'porra', 'caralho', 'buceta', 'puta', 'foder', 'fuck', 'shit'];

/** Validação local e no servidor; nenhum nome completo é solicitado. */
export function validarApelido(valor: string): string | null {
  const apelido = valor.trim().replace(/ +/g, ' ');
  const normalizado = apelido.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (!/^[\p{L}\p{N} ]{1,20}$/u.test(apelido) || BLOQUEADAS.some(palavra => normalizado.includes(palavra))) return null;
  return apelido;
}
