import { chaveNomeClube, erroDeSigla } from './clube';
import { formatarDataBrasilia } from './data-brasilia';

describe('chaveNomeClube (RN10)', () => {
  it('ignora espaços nas pontas, espaços repetidos e caixa, mas não acentos', () => {
    expect(chaveNomeClube('  águias   fc ')).toBe(chaveNomeClube('Águias FC'));
    expect(chaveNomeClube('Aguias FC')).not.toBe(chaveNomeClube('Águias FC'));
  });
});

describe('erroDeSigla (Limites de cada campo: acronym)', () => {
  it.each([
    ['Águias FC', 'AGU'],
    ['Aguias FC', 'AFC'],
    ['Delta FC', 'DFC'],
  ])('"%s" aceita a sigla %s', (nome, sigla) => {
    expect(erroDeSigla(nome, sigla)).toBeNull();
  });

  it.each([
    ['Águias FC', 'XFC', 'primeira letra'],
    ['Delta FC', 'DFF', 'ordem'],
    ['Ana Lima', 'AAA', 'iguais'],
    ['Ana Lima', 'ZAL', 'primeira letra'],
  ])('"%s" recusa a sigla %s (%s)', (nome, sigla) => {
    expect(erroDeSigla(nome, sigla)).not.toBeNull();
  });
});

describe('formatarDataBrasilia (RN01)', () => {
  it('mostra o horário de Brasília com -03:00', () => {
    expect(formatarDataBrasilia(new Date('2027-03-02T13:15:00Z'))).toBe(
      '2027-03-02T10:15:00-03:00',
    );
  });
});
