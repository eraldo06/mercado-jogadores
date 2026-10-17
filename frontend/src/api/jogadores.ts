import { requisitar } from './cliente';
import type { Condicao, Paginacao, Posicao } from './tipos';

export type Jogador = {
  id: number;
  name: string;
  position: Posicao;
  agility: number;
  age: number;
  condition: Condicao;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
};

export type ListaJogadores = {
  data: Jogador[];
  meta: Paginacao;
};

export type FiltrosJogadores = {
  search?: string;
  position?: Posicao;
  condition?: Condicao;
  free?: boolean;
  club_id?: number;
  min_age?: number;
  max_age?: number;
  min_value?: number;
  max_value?: number;
  sort?: string;
  page?: number;
  limit?: number;
};

export type NovoJogador = {
  name: string;
  position: Posicao;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
};

export type EdicaoJogador = {
  name: string;
  position: Posicao;
  agility: number;
  age: number;
};

export const jogadoresApi = {
  listar(filtros: FiltrosJogadores = {}): Promise<ListaJogadores> {
    return requisitar<ListaJogadores>('/players', {
      consulta: {
        ...filtros,
        free: filtros.free === undefined ? undefined : String(filtros.free),
      },
    });
  },

  buscar(id: number): Promise<Jogador> {
    return requisitar<Jogador>(`/players/${id}`);
  },

  criar(dados: NovoJogador): Promise<Jogador> {
    return requisitar<Jogador>('/players', { metodo: 'POST', corpo: dados });
  },

  editar(id: number, dados: EdicaoJogador): Promise<Jogador> {
    return requisitar<Jogador>(`/players/${id}`, {
      metodo: 'PUT',
      corpo: dados,
    });
  },

  alterarCondicao(id: number, condition: Condicao): Promise<Jogador> {
    return requisitar<Jogador>(`/players/${id}/condition`, {
      metodo: 'PATCH',
      corpo: { condition },
    });
  },

  excluir(id: number): Promise<void> {
    return requisitar<void>(`/players/${id}`, { metodo: 'DELETE' });
  },
};
