import { arredondarMoeda, decimal } from '../arredondamento';

const LIMITE_FAIXA_BAIXA = decimal(10);
const PERCENTUAL_FAIXA_BAIXA = decimal('0.10');
const PERCENTUAL_FAIXA_ALTA = decimal('0.20');

export function calcularLucro(valorCompra: number, valorVenda: number): number {
  return decimal(valorVenda).minus(valorCompra).toNumber();
}

export function calcularComissao(
  valorCompra: number,
  valorVenda: number,
): number {
  const lucro = decimal(calcularLucro(valorCompra, valorVenda));
  if (lucro.lessThanOrEqualTo(0)) {
    return 0;
  }
  const parteBaixa = lucro.lessThan(LIMITE_FAIXA_BAIXA)
    ? lucro
    : LIMITE_FAIXA_BAIXA;
  const parteAlta = lucro.greaterThan(LIMITE_FAIXA_BAIXA)
    ? lucro.minus(LIMITE_FAIXA_BAIXA)
    : decimal(0);
  const comissao = parteBaixa
    .mul(PERCENTUAL_FAIXA_BAIXA)
    .plus(parteAlta.mul(PERCENTUAL_FAIXA_ALTA));
  return arredondarMoeda(comissao).toNumber();
}
