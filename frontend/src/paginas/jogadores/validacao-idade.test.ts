import { describe, expect, it } from 'vitest';
import { validarFaixaIdade } from './validacao-idade';

describe('faixa de idade', () => {
  it('aceita 16 a 45', () => {
    expect(validarFaixaIdade('16', '45').dados).toEqual({ min: 16, max: 45 });
  });

  it('recusa idade fora de 16 a 45 e texto que não é inteiro', () => {
    expect(validarFaixaIdade('15', '').erros.minimo).toBe(
      'Use uma idade de 16 a 45 anos.',
    );
    expect(validarFaixaIdade('', '4,5').erros.maximo).toBe(
      'Use uma idade de 16 a 45 anos.',
    );
  });

  it('recusa mínimo maior que máximo', () => {
    expect(validarFaixaIdade('40', '20').erros.minimo).toBe(
      'A idade mínima não pode ser maior que a máxima.',
    );
  });
});
