import {
  calcularDiasRestantes,
  calcularMulta,
  calcularPercentualMulta,
} from './multa';

const MINUTO = 60 * 1000;
const DIA = 24 * 60 * MINUTO;
const momentoVenda = new Date('2026-11-05T19:40:00Z');

describe('calcularDiasRestantes (RN15, item 1)', () => {
  it.each([
    [116 * DIA + 17 * 60 * MINUTO + 35 * MINUTO, 117],
    [10 * DIA + 2 * 60 * MINUTO, 11],
    [30 * DIA, 30],
    [30 * DIA + MINUTO, 31],
    [180 * DIA, 180],
    [180 * DIA + MINUTO, 181],
    [200 * DIA, 200],
  ])('faltando %i ms dá %i dias', (faltam, esperado) => {
    const fim = new Date(momentoVenda.getTime() + faltam);
    expect(calcularDiasRestantes(fim, momentoVenda)).toBe(esperado);
  });

  it('fidelidade já vencida dá 0 dia', () => {
    const fim = new Date(momentoVenda.getTime() - DIA);
    expect(calcularDiasRestantes(fim, momentoVenda)).toBe(0);
  });
});

describe('calcularPercentualMulta (RN15, item 2)', () => {
  it.each([
    [0, 0],
    [1, 5],
    [30, 5],
    [31, 10],
    [180, 10],
    [181, 20],
  ])('%i dias restantes dá %i%%', (dias, esperado) => {
    expect(calcularPercentualMulta(dias)).toBe(esperado);
  });
});

describe('calcularMulta (RN15, item 3)', () => {
  it('10% de 40,00 dá 4,00', () => {
    expect(calcularMulta(40, 117)).toBe(4.0);
  });

  it('10% de 64,00 dá 6,40', () => {
    expect(calcularMulta(64, 31)).toBe(6.4);
  });

  it('20% de 60,00 dá 12,00 e é limitado a 10,00', () => {
    expect(calcularMulta(60, 181)).toBe(10.0);
  });

  it('fidelidade cumprida dá multa 0,00', () => {
    expect(calcularMulta(25, 0)).toBe(0);
  });
});
