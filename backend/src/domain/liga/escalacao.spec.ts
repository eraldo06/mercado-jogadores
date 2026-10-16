import { Posicao } from '../tipos';
import { Titular } from './placar';
import {
  ehEscalacaoValida,
  Formacao,
  montarEscalacao,
  ordenarElenco,
} from './escalacao';

const titular = (id: number, nome: string, posicao: Posicao): Titular => ({
  id,
  nome,
  posicao,
  condicao: 'APTO',
  atributos: {
    velocidade: 50,
    finalizacao: 50,
    passe: 50,
    drible: 50,
    defesa: 50,
    fisico: 50,
  },
});

describe('ehEscalacaoValida (RN19)', () => {
  const casos: [Formacao, Posicao[], boolean][] = [
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA'], true],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'], true],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'], true],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA'], true],
    ['2-1-1', ['GOL', 'ZAG', 'ZAG', 'MEI', 'ATA'], true],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'], false],
    ['3-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'], false],
    ['2-2', ['ZAG', 'LAT', 'ATA', 'ATA', 'MEI'], false],
    ['2-2', ['GOL', 'GOL', 'LAT', 'ATA', 'ATA'], false],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'ATA', 'ATA'], false],
  ];

  it.each(casos)('%s com %j dá %p', (formacao, posicoes, esperado) => {
    expect(ehEscalacaoValida(formacao, posicoes)).toBe(esperado);
  });
});

describe('ordenarElenco (RN11)', () => {
  it('ordena por posição GOL, ZAG, LAT, MEI, ATA', () => {
    const elenco = [
      titular(5, 'Otto Rangel', 'ATA'),
      titular(4, 'Lauro Neves', 'MEI'),
      titular(3, 'Davi Lins', 'LAT'),
      titular(2, 'Téo Brandão', 'ZAG'),
      titular(1, 'Rui Prado', 'GOL'),
    ];
    expect(ordenarElenco(elenco).map((j) => j.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('desempata por nome sem acentos e, por fim, pelo id', () => {
    const elenco = [
      titular(1, 'Ana-Maria', 'ZAG'),
      titular(2, 'Ana Lima', 'ZAG'),
      titular(4, 'Érico Tato', 'ZAG'),
      titular(3, 'Eric Tato', 'ZAG'),
    ];
    expect(ordenarElenco(elenco).map((j) => j.id)).toEqual([2, 1, 3, 4]);
  });
});

describe('montarEscalacao (RN20, passo 2)', () => {
  it('separa o goleiro e põe os 4 jogadores de linha na ordem do elenco', () => {
    const escalacao = montarEscalacao([
      titular(34, 'Otto Rangel', 'ATA'),
      titular(31, 'Davi Lins', 'LAT'),
      titular(30, 'Rui Prado', 'GOL'),
      titular(33, 'Lauro Neves', 'MEI'),
      titular(32, 'Téo Brandão', 'ZAG'),
    ]);
    expect(escalacao.goleiro.id).toBe(30);
    expect(escalacao.linha.map((j) => j.id)).toEqual([32, 31, 33, 34]);
  });
});
