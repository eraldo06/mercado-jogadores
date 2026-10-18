import { describe, expect, it } from 'vitest';
import {
  dataBrasilia,
  dataHoraBrasilia,
  moeda,
  moedaComSinal,
} from './formatar';

describe('formatação de moeda', () => {
  it('usa vírgula e duas casas', () => {
    expect(moeda(46)).toBe('46,00');
    expect(moeda(1234.5)).toBe('1.234,50');
  });

  it('mostra sinal de mais e de menos com o traço do enunciado', () => {
    expect(moedaComSinal(7.8)).toBe('+7,80');
    expect(moedaComSinal(-4.8)).toBe('−4,80');
    expect(moedaComSinal(0)).toBe('0,00');
  });
});

describe('formatação de data no horário de Brasília', () => {
  it('troca AAAA-MM-DDTHH:MM pelo formato da tela', () => {
    expect(dataHoraBrasilia('2026-11-11T20:00:00-03:00')).toBe(
      '11/11/2026 20:00',
    );
    expect(dataBrasilia('2026-11-11T20:00:00-03:00')).toBe('11/11/2026');
  });

  it('devolve o texto original quando não reconhece o formato', () => {
    expect(dataHoraBrasilia('texto livre')).toBe('texto livre');
  });
});
