import { describe, expect, it } from 'vitest';
import { validarApelido } from '../src/game/apelido';
describe('apelido seguro', () => {
  it('aceita somente um apelido curto com letras, números e espaços', () => {
    expect(validarApelido('  Estrela  Lilás 2 ')).toBe('Estrela Lilás 2');
    for (const valor of ['', ' ', 'a'.repeat(21), 'nome@email', '<script>', 'Merda', 'pórra']) expect(validarApelido(valor)).toBeNull();
  });
});
