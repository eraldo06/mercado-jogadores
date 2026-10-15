import {
  calcularCustoTotalCompra,
  calcularTaxaCompra,
  excedeLimiteDeCaixa,
} from './compra';

describe('compra (RN13)', () => {
  it.each([
    [28, 0],
    [30, 0],
    [30.01, 1.5],
    [47.62, 2.38],
    [48, 2.4],
  ])('valor de mercado %f tem taxa %f', (valorMercado, taxaEsperada) => {
    expect(calcularTaxaCompra(valorMercado)).toBe(taxaEsperada);
  });

  it('custo total é valor de mercado mais taxa', () => {
    expect(calcularCustoTotalCompra(47.62)).toBe(50.0);
  });

  it('custo igual a 50% do caixa é aceito', () => {
    expect(excedeLimiteDeCaixa(50.0, 100.0)).toBe(false);
  });

  it('custo acima de 50% do caixa é recusado', () => {
    expect(excedeLimiteDeCaixa(50.4, 100.0)).toBe(true);
  });

  it('limite sem arredondamento: caixa 261,15 aceita 130,575 e recusa 130,58', () => {
    expect(excedeLimiteDeCaixa(130.575, 261.15)).toBe(false);
    expect(excedeLimiteDeCaixa(130.58, 261.15)).toBe(true);
  });
});
