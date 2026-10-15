import { arredondarMoeda, decimal } from '../arredondamento';

const VALOR_MINIMO_COM_TAXA = 30;
const PERCENTUAL_TAXA = decimal('0.05');
const LIMITE_CAIXA_COMPRA = decimal('0.5');

export function calcularTaxaCompra(valorMercado: number): number {
  if (decimal(valorMercado).lessThanOrEqualTo(VALOR_MINIMO_COM_TAXA)) {
    return 0;
  }
  return arredondarMoeda(decimal(valorMercado).mul(PERCENTUAL_TAXA)).toNumber();
}

export function calcularCustoTotalCompra(valorMercado: number): number {
  return decimal(valorMercado)
    .plus(calcularTaxaCompra(valorMercado))
    .toNumber();
}

export function excedeLimiteDeCaixa(
  custoTotal: number,
  caixa: number,
): boolean {
  return decimal(custoTotal).greaterThan(
    decimal(caixa).mul(LIMITE_CAIXA_COMPRA),
  );
}
