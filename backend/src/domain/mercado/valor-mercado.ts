import { arredondarMoeda, decimal } from '../arredondamento';
import { Condicao } from '../tipos';

const TETO_DESCONTO = -40;
const PISO_VALOR_MERCADO = 1;

const descontoBase: Record<Condicao, number> = {
  APTO: 0,
  MAL_CONDICIONADO: 15,
  DOENTE: 30,
};

export function calcularDescontoCondicao(
  condicao: Condicao,
  agilidade: number,
): number {
  const base = descontoBase[condicao];
  if (condicao === 'APTO') {
    return 0;
  }
  if (agilidade >= 80) {
    return base / 2;
  }
  if (agilidade <= 30) {
    return base + 10;
  }
  return base;
}

export function calcularAjusteIdade(idade: number): number {
  if (idade <= 21) {
    return 10;
  }
  if (idade >= 32) {
    return -10;
  }
  return 0;
}

export type DadosValorMercado = {
  valorBase: number;
  condicao: Condicao;
  agilidade: number;
  idade: number;
};

export function calcularValorMercado({
  valorBase,
  condicao,
  agilidade,
  idade,
}: DadosValorMercado): number {
  const percentualTotal = Math.max(
    calcularAjusteIdade(idade) - calcularDescontoCondicao(condicao, agilidade),
    TETO_DESCONTO,
  );
  const valor = arredondarMoeda(
    decimal(valorBase).mul(decimal(100 + percentualTotal).div(100)),
  );
  return valor.lessThan(PISO_VALOR_MERCADO)
    ? PISO_VALOR_MERCADO
    : valor.toNumber();
}
