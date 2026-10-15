import {
  compararNomes,
  contarPalavras,
  ehInteiroPositivo,
  ignorarAcentos,
  normalizarEspacos,
  possuiControle,
} from './texto';

describe('normalizarEspacos (V4)', () => {
  it('remove espaços das pontas e junta espaços repetidos', () => {
    expect(normalizarEspacos('  Meia   Zeta ')).toBe('Meia Zeta');
  });

  it('não mexe em tabulação, que é recusada depois', () => {
    expect(normalizarEspacos('Meia\tZeta')).toBe('Meia\tZeta');
    expect(possuiControle('Meia\tZeta')).toBe(true);
  });
});

describe('contarPalavras (RN07 e limites de nome)', () => {
  it.each([
    ['Meia Zeta', 2],
    ['Ana - Lima', 2],
    ['Joao 12', 1],
    ['Meia', 1],
  ])('"%s" tem %i palavra(s) com letra', (texto, esperado) => {
    expect(contarPalavras(texto)).toBe(esperado);
  });
});

describe('ignorarAcentos (RN07)', () => {
  it.each([
    ['João', 'Joao'],
    ['Açúcar', 'Acucar'],
    ['Épsilon', 'Epsilon'],
  ])('"%s" vira "%s"', (texto, esperado) => {
    expect(ignorarAcentos(texto)).toBe(esperado);
  });
});

describe('compararNomes (ordem alfabética)', () => {
  it('põe Épsilon entre Delta e Gama', () => {
    const nomes = ['Gama', 'Épsilon', 'Delta'].sort(compararNomes);
    expect(nomes).toEqual(['Delta', 'Épsilon', 'Gama']);
  });

  it('põe o espaço antes do hífen, e o hífen antes das letras', () => {
    const nomes = ['Ana-Maria', 'Ana Lima'].sort(compararNomes);
    expect(nomes).toEqual(['Ana Lima', 'Ana-Maria']);
  });

  it('considera iguais nomes que só diferem por acento e caixa', () => {
    expect(compararNomes('Águias FC', 'aguias fc')).toBe(0);
  });
});

describe('ehInteiroPositivo (V8 e query params)', () => {
  it.each([
    ['1', true],
    ['2147483647', true],
    ['2147483648', false],
    ['0', false],
    ['01', false],
    ['-1', false],
    ['1.5', false],
    ['abc', false],
    ['', false],
  ])('"%s" é aceito: %s', (texto, esperado) => {
    expect(ehInteiroPositivo(texto)).toBe(esperado);
  });
});
