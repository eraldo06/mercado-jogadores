import { arredondarInteiro, decimal } from '../arredondamento';
import { Atributos, Posicao } from '../tipos';

const PESOS: Record<Posicao, Record<keyof Atributos, number>> = {
  GOL: {
    velocidade: 10,
    finalizacao: 0,
    passe: 20,
    drible: 0,
    defesa: 40,
    fisico: 30,
  },
  ZAG: {
    velocidade: 10,
    finalizacao: 0,
    passe: 15,
    drible: 0,
    defesa: 45,
    fisico: 30,
  },
  LAT: {
    velocidade: 25,
    finalizacao: 0,
    passe: 20,
    drible: 15,
    defesa: 25,
    fisico: 15,
  },
  MEI: {
    velocidade: 10,
    finalizacao: 15,
    passe: 35,
    drible: 25,
    defesa: 5,
    fisico: 10,
  },
  ATA: {
    velocidade: 20,
    finalizacao: 40,
    passe: 10,
    drible: 20,
    defesa: 0,
    fisico: 10,
  },
};

export function calcularOverall(
  posicao: Posicao,
  atributos: Atributos,
): number {
  const pesos = PESOS[posicao];
  const soma = (Object.keys(pesos) as (keyof Atributos)[]).reduce(
    (total, atributo) =>
      total.plus(decimal(atributos[atributo]).mul(pesos[atributo])),
    decimal(0),
  );
  return arredondarInteiro(soma.div(100)).toNumber();
}
