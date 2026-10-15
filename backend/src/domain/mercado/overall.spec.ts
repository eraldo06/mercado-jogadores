import { calcularOverall } from './overall';

describe('calcularOverall (RN06)', () => {
  it.each([
    [
      'MEI',
      {
        velocidade: 68,
        finalizacao: 65,
        passe: 80,
        drible: 78,
        defesa: 52,
        fisico: 60,
      },
      73,
    ],
    [
      'ATA',
      {
        velocidade: 78,
        finalizacao: 75,
        passe: 73,
        drible: 82,
        defesa: 48,
        fisico: 68,
      },
      76,
    ],
    [
      'LAT',
      {
        velocidade: 72,
        finalizacao: 70,
        passe: 78,
        drible: 76,
        defesa: 70,
        fisico: 66,
      },
      72,
    ],
    [
      'ZAG',
      {
        velocidade: 50,
        finalizacao: 90,
        passe: 60,
        drible: 40,
        defesa: 80,
        fisico: 75,
      },
      73,
    ],
    [
      'GOL',
      {
        velocidade: 55,
        finalizacao: 30,
        passe: 65,
        drible: 40,
        defesa: 72,
        fisico: 68,
      },
      68,
    ],
  ] as const)(
    'posição %s com atributos do enunciado dá overall %i',
    (posicao, atributos, esperado) => {
      expect(calcularOverall(posicao, atributos)).toBe(esperado);
    },
  );
});
