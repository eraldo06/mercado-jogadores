import { Atributos, Posicao } from '../tipos';
import { Escalacao, Titular, TitularDeLinha, simularPartida } from './placar';

const atributos = (valores: Partial<Atributos>): Atributos => ({
  velocidade: 50,
  finalizacao: 50,
  passe: 50,
  drible: 50,
  defesa: 50,
  fisico: 50,
  ...valores,
});

const titular = (
  id: number,
  nome: string,
  posicao: Posicao,
  valores: Partial<Atributos>,
  condicao: Titular['condicao'] = 'APTO',
): Titular => ({ id, nome, posicao, condicao, atributos: atributos(valores) });

const linha = (t: Titular): TitularDeLinha => t as TitularDeLinha;

const mandante: Escalacao = {
  goleiro: titular(30, 'Rui Prado', 'GOL', { defesa: 77 }),
  linha: [
    linha(titular(32, 'Téo Brandão', 'ZAG', { defesa: 84 })),
    linha(
      titular(
        31,
        'Davi Lins',
        'LAT',
        { drible: 74, defesa: 66 },
        'MAL_CONDICIONADO',
      ),
    ),
    linha(titular(33, 'Lauro Neves', 'MEI', { passe: 82 })),
    linha(titular(34, 'Otto Rangel', 'ATA', { finalizacao: 75 })),
  ],
};

const visitante: Escalacao = {
  goleiro: titular(40, 'Ivo Teles', 'GOL', { defesa: 72 }),
  linha: [
    linha(titular(41, 'Hugo Vaz', 'ZAG', { defesa: 84 })),
    linha(titular(42, 'Lino Matos', 'LAT', { drible: 79, defesa: 63 })),
    linha(titular(43, 'Nei Soares', 'MEI', { passe: 70 })),
    linha(titular(44, 'Ugo Falcão', 'ATA', { finalizacao: 81 })),
  ],
};

describe('simularPartida (RN20)', () => {
  const partida = simularPartida(mandante, visitante);

  it('gera 6 duelos na ordem da regra', () => {
    expect(partida.duelos.map((d) => d.ordem)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('calcula os valores de cada duelo, com efeito da condição', () => {
    expect(partida.duelos.map((d) => [d.valorAtaque, d.valorDefesa])).toEqual([
      [75, 72],
      [82, 84],
      [63, 63],
      [81, 77],
      [70, 84],
      [79, 56],
    ]);
  });

  it('marca gol só quando o ataque é maior que a defesa', () => {
    expect(partida.duelos.map((d) => d.gol)).toEqual([
      true,
      false,
      false,
      true,
      false,
      true,
    ]);
  });

  it('placar é 1 x 2 com visitante vencedor', () => {
    expect(partida.golsMandante).toBe(1);
    expect(partida.golsVisitante).toBe(2);
    expect(partida.resultado).toBe('VISITANTE');
  });

  it('usa o atributo da posição do atacante', () => {
    expect(partida.duelos.map((d) => d.atributoAtaque)).toEqual([
      'shooting',
      'passing',
      'dribbling',
      'shooting',
      'passing',
      'dribbling',
    ]);
  });

  it('empate quando os gols são iguais', () => {
    const semGols: Escalacao = {
      goleiro: titular(50, 'Goleiro', 'GOL', { defesa: 99 }),
      linha: [
        linha(titular(51, 'Zagueiro', 'ZAG', { defesa: 99 })),
        linha(titular(52, 'Lateral', 'LAT', { drible: 1, defesa: 99 })),
        linha(titular(53, 'Meia', 'MEI', { passe: 1 })),
        linha(titular(54, 'Atacante', 'ATA', { finalizacao: 1 })),
      ],
    };
    expect(simularPartida(semGols, semGols).resultado).toBe('EMPATE');
  });
});
