import { arredondarInteiro, decimal } from '../arredondamento';
import { Atributos, Condicao, Posicao } from '../tipos';

export type AtributoAtaque = 'shooting' | 'passing' | 'dribbling';

export type Titular = {
  id: number;
  nome: string;
  posicao: Posicao;
  condicao: Condicao;
  atributos: Atributos;
};

export type TitularDeLinha = Titular & {
  posicao: 'ZAG' | 'LAT' | 'MEI' | 'ATA';
};

export type Escalacao = {
  goleiro: Titular;
  linha: [TitularDeLinha, TitularDeLinha, TitularDeLinha, TitularDeLinha];
};

export type Clube = 'MANDANTE' | 'VISITANTE';

export type Resultado = Clube | 'EMPATE';

export type Duelo = {
  ordem: number;
  clubeAtacante: Clube;
  atacante: Titular;
  atributoAtaque: AtributoAtaque;
  valorAtaque: number;
  defensor: Titular;
  valorDefesa: number;
  gol: boolean;
};

export type ResultadoPartida = {
  duelos: Duelo[];
  golsMandante: number;
  golsVisitante: number;
  resultado: Resultado;
};

const FATOR_MAL_CONDICIONADO = decimal('0.85');

const ATAQUE_POR_POSICAO: Record<
  TitularDeLinha['posicao'],
  { atributo: keyof Atributos; nome: AtributoAtaque }
> = {
  ATA: { atributo: 'finalizacao', nome: 'shooting' },
  MEI: { atributo: 'passe', nome: 'passing' },
  ZAG: { atributo: 'drible', nome: 'dribbling' },
  LAT: { atributo: 'drible', nome: 'dribbling' },
};

function valorEfetivo(titular: Titular, atributo: keyof Atributos): number {
  const valor = titular.atributos[atributo];
  if (titular.condicao === 'MAL_CONDICIONADO') {
    return arredondarInteiro(
      decimal(valor).mul(FATOR_MAL_CONDICIONADO),
    ).toNumber();
  }
  return valor;
}

function criarDuelo(
  ordem: number,
  clubeAtacante: Clube,
  atacante: TitularDeLinha,
  defensor: Titular,
): Duelo {
  const ataque = ATAQUE_POR_POSICAO[atacante.posicao];
  const valorAtaque = valorEfetivo(atacante, ataque.atributo);
  const valorDefesa = valorEfetivo(defensor, 'defesa');
  return {
    ordem,
    clubeAtacante,
    atacante,
    atributoAtaque: ataque.nome,
    valorAtaque,
    defensor,
    valorDefesa,
    gol: valorAtaque > valorDefesa,
  };
}

function duelosDoLado(
  clube: Clube,
  atacantes: Escalacao,
  defensores: Escalacao,
  ordemInicial: number,
): Duelo[] {
  const linhaAtacante = [
    atacantes.linha[3],
    atacantes.linha[2],
    atacantes.linha[1],
  ];
  const alvos = [defensores.goleiro, defensores.linha[0], defensores.linha[1]];
  return linhaAtacante.map((atacante, indice) =>
    criarDuelo(ordemInicial + indice, clube, atacante, alvos[indice]),
  );
}

export function simularPartida(
  mandante: Escalacao,
  visitante: Escalacao,
): ResultadoPartida {
  const duelos = [
    ...duelosDoLado('MANDANTE', mandante, visitante, 1),
    ...duelosDoLado('VISITANTE', visitante, mandante, 4),
  ];

  const golsMandante = duelos.filter(
    (d) => d.gol && d.clubeAtacante === 'MANDANTE',
  ).length;
  const golsVisitante = duelos.filter(
    (d) => d.gol && d.clubeAtacante === 'VISITANTE',
  ).length;

  return {
    duelos,
    golsMandante,
    golsVisitante,
    resultado: decidirResultado(golsMandante, golsVisitante),
  };
}

function decidirResultado(
  golsMandante: number,
  golsVisitante: number,
): Resultado {
  if (golsMandante > golsVisitante) {
    return 'MANDANTE';
  }
  if (golsVisitante > golsMandante) {
    return 'VISITANTE';
  }
  return 'EMPATE';
}
