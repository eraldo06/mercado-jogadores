import { calcularTotalPaginas, paginar } from './listagem';

describe('paginação (RN07)', () => {
  const itens = Array.from({ length: 23 }, (_, i) => i + 1);

  it.each([
    [23, 10, 3],
    [23, 50, 1],
    [0, 10, 0],
  ])('%i itens com limite %i dão %i página(s)', (total, limite, esperado) => {
    expect(calcularTotalPaginas(total, limite)).toBe(esperado);
  });

  it.each([
    [1, 10, [1, 10]],
    [3, 10, [21, 23]],
    [4, 10, []],
  ])('página %i com limite %i traz os itens %j', (pagina, limite, esperado) => {
    const resultado = paginar(itens, pagina, limite);
    expect(
      resultado.length > 0
        ? [resultado[0], resultado[resultado.length - 1]]
        : [],
    ).toEqual(esperado);
  });
});
