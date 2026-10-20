import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Toaster } from '../../components/ui/sonner';
import { PaginaJogadores } from './pagina-jogadores';

const { editarMock } = vi.hoisted(() => ({
  editarMock: vi.fn(async () => ({ id: 4, name: 'Davi Melo Filho' })),
}));

const jogador = {
  id: 4,
  name: 'Davi Melo',
  position: 'MEI',
  agility: 60,
  age: 23,
  condition: 'APTO',
  base_value: 40,
  market_value: 40,
  pace: 60,
  shooting: 60,
  passing: 60,
  dribbling: 60,
  defending: 60,
  physical: 60,
  potential: 70,
  overall: 70,
  club_id: null,
};

vi.mock('../../api/jogadores', () => ({
  jogadoresApi: {
    listar: async () => ({
      data: [jogador],
      meta: { page: 1, limit: 10, total_items: 1, total_pages: 1 },
    }),
    editar: editarMock,
  },
}));

vi.mock('../../api/clubes', () => ({
  clubesApi: { listar: async () => [] },
}));

describe('edição de jogador', () => {
  it('mostra o toast de sucesso depois de salvar', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/jogadores']}>
          <PaginaJogadores />
          <Toaster />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const gatilho = await screen.findByRole('button', {
      name: /Ações de Davi Melo/,
    });
    fireEvent.pointerDown(gatilho, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    });
    fireEvent.click(gatilho);
    fireEvent.click(await screen.findByRole('menuitem', { name: /Editar/ }));

    const nome = await screen.findByDisplayValue('Davi Melo');
    fireEvent.change(nome, { target: { value: 'Davi Melo Filho' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar/ }));

    await waitFor(() => expect(editarMock).toHaveBeenCalled());
    expect(
      await screen.findByText('Jogador atualizado', {}, { timeout: 3000 }),
    ).toBeTruthy();
  });
});
