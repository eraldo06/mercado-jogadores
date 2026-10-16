import { calcularResumo } from './resumo';

describe('calcularResumo (RN17)', () => {
  it('soma compra e venda do exemplo do enunciado', () => {
    const resumo = calcularResumo([
      {
        tipo: 'COMPRA',
        valor: 37,
        taxa: 1.85,
        multa: 0,
        lucro: null,
        variacaoCaixa: -38.85,
      },
      {
        tipo: 'VENDA',
        valor: 40,
        taxa: 0.3,
        multa: 4,
        lucro: 3,
        variacaoCaixa: 35.7,
      },
    ]);
    expect(resumo).toEqual({
      total_spent: 38.85,
      total_received: 35.7,
      total_fees: 2.15,
      total_penalties: 4,
      total_profit: 3,
    });
  });

  it('retorna zeros sem transações', () => {
    expect(calcularResumo([])).toEqual({
      total_spent: 0,
      total_received: 0,
      total_fees: 0,
      total_penalties: 0,
      total_profit: 0,
    });
  });
});
