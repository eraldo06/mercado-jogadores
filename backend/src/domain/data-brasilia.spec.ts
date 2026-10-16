import { formatarDataBrasilia, interpretarDataBrasilia } from './data-brasilia';

describe('interpretarDataBrasilia (RN01)', () => {
  it('lê a data no horário de Brasília', () => {
    expect(
      interpretarDataBrasilia('2027-03-02T10:15-03:00')?.toISOString(),
    ).toBe('2027-03-02T13:15:00.000Z');
  });

  it.each([
    '2027-02-30T10:15-03:00',
    '2027-03-02T24:00-03:00',
    '2027-03-02T10:60-03:00',
    '2027-03-02T10:15:00-03:00',
    '2027-03-02T10:15',
    '2027-03-02T10:15-02:00',
  ])('recusa %s', (texto) => {
    expect(interpretarDataBrasilia(texto)).toBeNull();
  });

  it('volta ao mesmo texto ao formatar', () => {
    const data = interpretarDataBrasilia('2027-03-02T10:15-03:00');
    expect(data && formatarDataBrasilia(data)).toBe(
      '2027-03-02T10:15:00-03:00',
    );
  });
});
