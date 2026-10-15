import { arredondarMoeda, decimal } from '../arredondamento';

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const TETO_MULTA = decimal(10);

export function calcularDiasRestantes(
  fimFidelidade: Date,
  momentoVenda: Date,
): number {
  const diferenca = fimFidelidade.getTime() - momentoVenda.getTime();
  if (diferenca <= 0) {
    return 0;
  }
  return Math.ceil(diferenca / MILISSEGUNDOS_POR_DIA);
}

export function calcularPercentualMulta(diasRestantes: number): number {
  if (diasRestantes === 0) {
    return 0;
  }
  if (diasRestantes <= 30) {
    return 5;
  }
  if (diasRestantes <= 180) {
    return 10;
  }
  return 20;
}

export function calcularMulta(
  valorMercado: number,
  diasRestantes: number,
): number {
  const multa = arredondarMoeda(
    decimal(valorMercado).mul(calcularPercentualMulta(diasRestantes)).div(100),
  );
  return multa.greaterThan(TETO_MULTA)
    ? TETO_MULTA.toNumber()
    : multa.toNumber();
}
