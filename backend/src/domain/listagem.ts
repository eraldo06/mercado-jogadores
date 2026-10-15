export function calcularTotalPaginas(
  totalItens: number,
  limite: number,
): number {
  return Math.ceil(totalItens / limite);
}

export function paginar<T>(itens: T[], pagina: number, limite: number): T[] {
  const inicio = (pagina - 1) * limite;
  return itens.slice(inicio, inicio + limite);
}
