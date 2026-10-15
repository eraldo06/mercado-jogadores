import { calcularValorBase } from './valor-base';

describe('calcularValorBase (RN06)', () => {
  it.each([
    [75, 86, 25, 40.0],
    [60, 70, 30, 10.0],
    [61, 70, 30, 12.0],
    [76, 80, 22, 46.0],
    [85, 92, 27, 100.0],
    [70, 84, 21, 34.2],
    [70, 84, 22, 30.0],
    [45, 90, 18, 3.63],
    [40, 66, 36, 1.0],
  ])(
    'overall %i, potencial %i, idade %i dá valor base %f',
    (overall, potencial, idade, esperado) => {
      expect(calcularValorBase({ overall, potencial, idade })).toBe(esperado);
    },
  );
});
