import { calcularValorMercado } from './valor-mercado';

describe('calcularValorMercado (RN02 a RN05)', () => {
  it.each([
    [82, 'APTO', 20, 25, 82.0],
    [82, 'APTO', 50, 19, 90.2],
    [82, 'MAL_CONDICIONADO', 50, 25, 69.7],
    [82, 'MAL_CONDICIONADO', 80, 21, 84.05],
    [82, 'MAL_CONDICIONADO', 30, 33, 53.3],
    [82, 'DOENTE', 90, 25, 69.7],
    [82, 'DOENTE', 30, 25, 49.2],
    [82, 'DOENTE', 10, 40, 49.2],
    [9.5, 'MAL_CONDICIONADO', 85, 25, 8.79],
    [1.0, 'MAL_CONDICIONADO', 50, 35, 1.0],
  ] as const)(
    'base %f, %s, agilidade %i, idade %i dá valor de mercado %f',
    (valorBase, condicao, agilidade, idade, esperado) => {
      expect(
        calcularValorMercado({ valorBase, condicao, agilidade, idade }),
      ).toBe(esperado);
    },
  );
});
