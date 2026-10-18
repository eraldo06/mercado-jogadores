import { describe, expect, it } from 'vitest';
import { validarPartida } from './validacao-partida';

describe('nova partida', () => {
  it('exige mandante e visitante', () => {
    const { dados, erros } = validarPartida({ mandante: '', visitante: '' });
    expect(dados).toBeNull();
    expect(erros.mandante).toBe('Escolha o clube mandante.');
    expect(erros.visitante).toBe('Escolha o clube visitante.');
  });

  it('recusa o mesmo clube dos dois lados', () => {
    expect(
      validarPartida({ mandante: '2', visitante: '2' }).erros.visitante,
    ).toBe('Precisa ser um clube diferente do mandante.');
  });

  it('converte os ids para número', () => {
    expect(validarPartida({ mandante: '1', visitante: '2' })).toEqual({
      dados: { home_club_id: 1, away_club_id: 2 },
      erros: {},
    });
  });
});
