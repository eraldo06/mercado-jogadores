import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ClubeResumo } from '../../api/clubes';
import type { Jogador } from '../../api/jogadores';
import { DialogComprar } from './dialog-comprar';

const jogador: Jogador = {
  id: 1,
  name: 'Eduardo Paiva',
  position: 'MEI',
  agility: 68,
  age: 26,
  condition: 'APTO',
  base_value: 46,
  market_value: 46,
  pace: 60,
  shooting: 60,
  passing: 60,
  dribbling: 60,
  defending: 60,
  physical: 60,
  potential: 70,
  overall: 76,
  club_id: null,
};

const clubes: ClubeResumo[] = [
  {
    id: 6,
    name: 'Tubarões EC',
    acronym: 'TUB',
    cash: 300,
    squad_value: 0,
    net_worth: 300,
  },
];

describe('DialogComprar', () => {
  it('não envia sem clube e mostra a mensagem junto ao campo', () => {
    const aoSalvar = vi.fn();
    render(
      <DialogComprar
        jogador={jogador}
        clubes={clubes}
        aoFechar={() => {}}
        carregando={false}
        erroApi={undefined}
        aoSalvar={aoSalvar}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(aoSalvar).not.toHaveBeenCalled();
    expect(screen.getByText('Escolha o clube comprador.')).toBeInTheDocument();
  });

  it('mostra o valor de mercado do jogador', () => {
    render(
      <DialogComprar
        jogador={jogador}
        clubes={clubes}
        aoFechar={() => {}}
        carregando={false}
        erroApi={undefined}
        aoSalvar={() => {}}
      />,
    );
    expect(screen.getByText('46,00')).toBeInTheDocument();
  });
});
