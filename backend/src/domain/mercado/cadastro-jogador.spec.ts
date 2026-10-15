import {
  erroDeIdadeEAgilidade,
  erroDeIndicadores,
  IndicadoresJogador,
} from './cadastro-jogador';

const meiaLua: IndicadoresJogador = {
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

describe('erroDeIndicadores (B01: regras que cruzam campos)', () => {
  it('aceita o cadastro do exemplo do enunciado', () => {
    expect(erroDeIndicadores(meiaLua)).toBeNull();
  });

  it('recusa soma dos seis atributos acima de 480', () => {
    const indicadores = {
      ...meiaLua,
      pace: 99,
      shooting: 99,
      passing: 99,
      dribbling: 99,
      defending: 99,
      physical: 90,
    };
    expect(erroDeIndicadores(indicadores)).toMatch(/480/);
  });

  it('recusa potential menor que o maior atributo', () => {
    expect(erroDeIndicadores({ ...meiaLua, potential: 80 })).toMatch(
      /potential/,
    );
  });

  it('exige potential igual ao maior atributo com 33 anos ou mais', () => {
    expect(erroDeIndicadores({ ...meiaLua, age: 33, potential: 86 })).toMatch(
      /33 anos/,
    );
    expect(
      erroDeIndicadores({ ...meiaLua, age: 33, potential: 82 }),
    ).toBeNull();
  });

  it('recusa agilidade acima de 85 com 35 anos ou mais', () => {
    expect(
      erroDeIndicadores({ ...meiaLua, age: 35, potential: 82, agility: 86 }),
    ).toMatch(/agility/);
    expect(
      erroDeIndicadores({ ...meiaLua, age: 35, potential: 82, agility: 85 }),
    ).toBeNull();
  });
});

describe('erroDeIdadeEAgilidade', () => {
  it.each([
    [90, 34, false],
    [90, 35, true],
    [85, 35, false],
  ])('agilidade %i com idade %i recusada: %s', (agilidade, idade, recusada) => {
    expect(erroDeIdadeEAgilidade(agilidade, idade) !== null).toBe(recusada);
  });
});
