export type IndicadoresJogador = {
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
};

const IDADE_LIMITE_AGILIDADE = 35;
const AGILIDADE_MAXIMA_VETERANO = 85;
const IDADE_LIMITE_POTENCIAL = 33;
const SOMA_MAXIMA_ATRIBUTOS = 480;

export function erroDeIdadeEAgilidade(
  agilidade: number,
  idade: number,
): string | null {
  if (
    idade >= IDADE_LIMITE_AGILIDADE &&
    agilidade > AGILIDADE_MAXIMA_VETERANO
  ) {
    return `agility deve ser no máximo ${AGILIDADE_MAXIMA_VETERANO} para jogador com ${IDADE_LIMITE_AGILIDADE} anos ou mais`;
  }
  return null;
}

export function erroDeIndicadores(
  indicadores: IndicadoresJogador,
): string | null {
  const atributos = [
    indicadores.pace,
    indicadores.shooting,
    indicadores.passing,
    indicadores.dribbling,
    indicadores.defending,
    indicadores.physical,
  ];
  const soma = atributos.reduce((total, valor) => total + valor, 0);
  const maiorAtributo = Math.max(...atributos);

  if (soma > SOMA_MAXIMA_ATRIBUTOS) {
    return `a soma dos seis atributos não pode passar de ${SOMA_MAXIMA_ATRIBUTOS}`;
  }
  if (indicadores.potential < maiorAtributo) {
    return 'potential deve ser maior ou igual ao maior dos seis atributos';
  }
  if (
    indicadores.age >= IDADE_LIMITE_POTENCIAL &&
    indicadores.potential !== maiorAtributo
  ) {
    return `potential deve ser igual ao maior dos seis atributos para jogador com ${IDADE_LIMITE_POTENCIAL} anos ou mais`;
  }
  return erroDeIdadeEAgilidade(indicadores.agility, indicadores.age);
}
