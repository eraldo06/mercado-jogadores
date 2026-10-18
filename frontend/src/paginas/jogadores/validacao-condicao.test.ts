import { describe, expect, it } from 'vitest';
import { validarCondicao } from './validacao-condicao';

describe('alteração de condição', () => {
  it('aceita a condição escolhida', () => {
    expect(validarCondicao('APTO', 'MAL_CONDICIONADO')).toEqual({
      condicao: 'MAL_CONDICIONADO',
    });
  });

  it('recusa valor fora da lista', () => {
    expect(validarCondicao('APTO', 'CANSADO')).toEqual({
      condicao: null,
      erro: 'Escolha uma condição.',
    });
  });

  it('não deixa Doente ir direto para Apto (RN06 das condições)', () => {
    expect(validarCondicao('DOENTE', 'APTO')).toEqual({
      condicao: null,
      erro: 'De Doente não passa direto para Apto.',
    });
  });
});
