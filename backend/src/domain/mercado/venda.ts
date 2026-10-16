import { arredondarMoeda, decimal } from '../arredondamento';
import { calcularComissao, calcularLucro } from './comissao';
import { calcularMulta, calcularPercentualMulta } from './multa';

export type ResultadoVenda = {
  percentualMulta: number;
  multa: number;
  lucro: number;
  comissao: number;
  credito: number;
  situacao: 'RESCINDIDO' | 'ENCERRADO';
};

export type DadosVenda = {
  valorCompra: number;
  valorMercado: number;
  diasRestantes: number;
};

export function calcularVenda({
  valorCompra,
  valorMercado,
  diasRestantes,
}: DadosVenda): ResultadoVenda {
  const percentualMulta = calcularPercentualMulta(diasRestantes);
  const multa = calcularMulta(valorMercado, diasRestantes);
  const comissao = calcularComissao(valorCompra, valorMercado);
  const credito = arredondarMoeda(
    decimal(valorMercado).minus(multa).minus(comissao),
  ).toNumber();

  return {
    percentualMulta,
    multa,
    lucro: calcularLucro(valorCompra, valorMercado),
    comissao,
    credito,
    situacao: percentualMulta > 0 ? 'RESCINDIDO' : 'ENCERRADO',
  };
}
