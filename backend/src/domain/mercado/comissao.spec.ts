import { calcularComissao, calcularLucro } from './comissao';

describe('calcularLucro (RN16, item 2)', () => {
  it('valor de venda menos valor de compra', () => {
    expect(calcularLucro(60, 75)).toBe(15);
  });
});

describe('calcularComissao (RN16, item 3)', () => {
  it.each([
    [37, 40, 0.3],
    [50, 42.5, 0],
    [26.15, 30, 0.39],
    [25, 25, 0],
    [60, 75, 2.0],
    [10, 20.01, 1.0],
    [22.15, 26, 0.39],
  ])(
    'compra %f, venda %f dá comissão %f',
    (valorCompra, valorVenda, esperado) => {
      expect(calcularComissao(valorCompra, valorVenda)).toBe(esperado);
    },
  );
});
