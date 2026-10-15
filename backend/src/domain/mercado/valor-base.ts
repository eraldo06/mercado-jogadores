import { arredondarMoeda, decimal } from '../arredondamento';

const IDADE_JOVEM_PROMESSA = 21;

export type DadosValorBase = {
  overall: number;
  potencial: number;
  idade: number;
};

export function calcularValorBase({
  overall,
  potencial,
  idade,
}: DadosValorBase): number {
  const faixa1 = decimal(Math.max(0, Math.min(overall, 60) - 40)).mul('0.5');
  const faixa2 = decimal(Math.max(0, Math.min(overall, 75) - 60)).mul(2);
  const faixa3 = decimal(Math.max(0, overall - 75)).mul(6);
  let parte = faixa1.plus(faixa2).plus(faixa3);

  if (idade <= IDADE_JOVEM_PROMESSA) {
    parte = parte.mul(decimal(100 + potencial - overall).div(100));
  }

  const valor = arredondarMoeda(parte);
  return valor.lessThan(1) ? 1 : valor.toNumber();
}
