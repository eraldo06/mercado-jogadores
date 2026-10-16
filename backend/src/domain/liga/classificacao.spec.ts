import { calcularClassificacao } from './classificacao';

const clubes = [
  { id: 1, nome: 'Águias FC' },
  { id: 2, nome: 'Delta FC' },
  { id: 3, nome: 'Gama SC' },
  { id: 4, nome: 'Épsilon EC' },
  { id: 5, nome: 'Mangue FC' },
  { id: 6, nome: 'Tubarões EC' },
];

describe('calcularClassificacao (RN21)', () => {
  it('ordena como na tabela do enunciado, com clubes sem jogos zerados', () => {
    const partidas = [
      { mandanteId: 1, visitanteId: 2, golsMandante: 1, golsVisitante: 2 },
      { mandanteId: 3, visitanteId: 4, golsMandante: 2, golsVisitante: 1 },
      { mandanteId: 4, visitanteId: 1, golsMandante: 3, golsVisitante: 2 },
      { mandanteId: 2, visitanteId: 3, golsMandante: 0, golsVisitante: 1 },
    ];

    const tabela = calcularClassificacao(clubes, partidas);

    expect(
      tabela.map((l) => [l.posicao, l.nome, l.pontos, l.saldo, l.golsPro]),
    ).toEqual([
      [1, 'Gama SC', 6, 2, 3],
      [2, 'Épsilon EC', 3, 0, 4],
      [3, 'Delta FC', 3, 0, 2],
      [4, 'Mangue FC', 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0],
      [6, 'Águias FC', 0, -2, 3],
    ]);
  });

  it('dá 1 ponto a cada clube no empate', () => {
    const tabela = calcularClassificacao(clubes.slice(0, 2), [
      { mandanteId: 1, visitanteId: 2, golsMandante: 1, golsVisitante: 1 },
    ]);

    expect(tabela.map((l) => [l.nome, l.pontos, l.empates])).toEqual([
      ['Águias FC', 1, 1],
      ['Delta FC', 1, 1],
    ]);
  });
});
