import { describe, expect, it } from 'vitest';
import { validarFaixaMoeda } from './validacao-moeda';

describe('faixa de valor de mercado', () => {
  it('aceita vírgula e ponto como separador decimal', () => {
    expect(validarFaixaMoeda('10,5', '550')).toEqual({
      dados: { min: 10.5, max: 550 },
      erros: {},
    });
  });

  it('deixa campos vazios sem valor', () => {
    expect(validarFaixaMoeda('', '')).toEqual({
      dados: { min: undefined, max: undefined },
      erros: {},
    });
  });

  it('recusa formato errado com mensagem no campo', () => {
    const { dados, erros } = validarFaixaMoeda('1.2.3', '');
    expect(dados).toBeNull();
    expect(erros.minimo).toBe('Use um valor como 10 ou 10,50.');
  });

  it('recusa acima de 550', () => {
    expect(validarFaixaMoeda('', '600').erros.maximo).toBe(
      'Use um valor de 0 a 550.',
    );
  });

  it('recusa mínimo maior que máximo', () => {
    expect(validarFaixaMoeda('50', '10').erros.minimo).toBe(
      'O valor mínimo não pode ser maior que o máximo.',
    );
  });
});
