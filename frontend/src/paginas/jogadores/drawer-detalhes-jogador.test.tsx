import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Jogador } from '../../api/jogadores';
import { DrawerDetalhesJogador } from './drawer-detalhes-jogador';

const livre: Jogador = {
  id: 1,
  name: 'Eduardo Paiva',
  position: 'MEI',
  agility: 68,
  age: 26,
  condition: 'APTO',
  base_value: 46,
  market_value: 46,
  pace: 70,
  shooting: 72,
  passing: 84,
  dribbling: 80,
  defending: 52,
  physical: 63,
  potential: 86,
  overall: 76,
  club_id: null,
};

const acoes = {
  aoFechar: vi.fn(),
  aoEditar: vi.fn(),
  aoAlterarCondicao: vi.fn(),
  aoComprar: vi.fn(),
};

describe('detalhes do jogador', () => {
  it('mostra indicadores, atributos e clube do jogador livre', () => {
    render(<DrawerDetalhesJogador jogador={livre} {...acoes} />);

    expect(screen.getByRole('dialog', { name: 'Eduardo Paiva' })).toBeTruthy();
    expect(screen.getAllByText('46,00')).toHaveLength(2);
    expect(screen.getByText('Calculado no cadastro')).toBeTruthy();
    expect(screen.getByText('Velocidade')).toBeTruthy();
    expect(screen.getByText('84')).toBeTruthy();
    expect(
      screen.getByText('Até o potencial (86), que nenhum atributo passa'),
    ).toBeTruthy();
    expect(screen.getByText('26 anos')).toBeTruthy();
    expect(screen.getAllByText('Livre')).toHaveLength(2);
  });

  it('mostra Comprar só para jogador livre', () => {
    const { unmount } = render(
      <DrawerDetalhesJogador jogador={livre} {...acoes} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Comprar/ }));
    expect(acoes.aoComprar).toHaveBeenCalledWith(livre);
    unmount();

    render(
      <DrawerDetalhesJogador
        jogador={{ ...livre, club_id: 2 }}
        nomeDoClube="Águias FC"
        {...acoes}
      />,
    );
    expect(screen.queryByRole('button', { name: /Comprar/ })).toBeNull();
    expect(screen.getAllByText('Águias FC')).toHaveLength(2);
  });
});
