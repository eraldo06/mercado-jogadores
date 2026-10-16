import { calcularVenda } from './venda';

describe('calcularVenda (RN15 e RN16)', () => {
  it.each([
    [37, 40, 117, 10, 4, 3, 0.3, 35.7, 'RESCINDIDO'],
    [50, 42.5, 200, 20, 8.5, -7.5, 0, 34, 'RESCINDIDO'],
    [26.15, 30, 20, 5, 1.5, 3.85, 0.39, 28.11, 'RESCINDIDO'],
    [25, 25, 0, 0, 0, 0, 0, 25, 'ENCERRADO'],
    [60, 75, 200, 20, 10, 15, 2, 63, 'RESCINDIDO'],
  ] as const)(
    'compra %f, venda %f, %i dias: multa %f, lucro %f, comissão %f, crédito %f',
    (
      valorCompra,
      valorMercado,
      diasRestantes,
      percentual,
      multa,
      lucro,
      comissao,
      credito,
      situacao,
    ) => {
      expect(
        calcularVenda({ valorCompra, valorMercado, diasRestantes }),
      ).toEqual({
        percentualMulta: percentual,
        multa,
        lucro,
        comissao,
        credito,
        situacao,
      });
    },
  );
});
