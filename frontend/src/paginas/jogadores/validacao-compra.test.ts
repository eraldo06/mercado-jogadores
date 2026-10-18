import { describe, expect, it } from 'vitest';
import { validarCompra } from './validacao-compra';

function dataEm(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

describe('compra de jogador', () => {
  it('monta o fim da fidelidade no formato da RN01 (-03:00)', () => {
    const data = dataEm(30);
    expect(validarCompra({ clube: '3', data, hora: '15:00' })).toEqual({
      dados: { club_id: 3, loyalty_until: `${data}T15:00-03:00` },
      erros: {},
    });
  });

  it('recusa data passada com mensagem junto ao campo', () => {
    const { dados, erros } = validarCompra({
      clube: '3',
      data: dataEm(-1),
      hora: '15:00',
    });
    expect(dados).toBeNull();
    expect(erros.data).toMatch(/depois de agora/);
  });

  it('recusa data que não existe, como 30 de fevereiro', () => {
    const { erros } = validarCompra({
      clube: '3',
      data: '2027-02-30',
      hora: '10:00',
    });
    expect(erros.data).toBe('Use uma data válida.');
  });

  it('exige clube', () => {
    expect(
      validarCompra({ clube: '', data: dataEm(30), hora: '10:00' }).erros.clube,
    ).toBe('Escolha o clube comprador.');
  });
});
