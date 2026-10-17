import { requisitar } from './cliente';
import type { Jogador } from './jogadores';

export type ClubeResumo = {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
};

export type ContratoJogador = {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
};

export type JogadorDoClube = Jogador & {
  contract: ContratoJogador | null;
};

export type ClubeDetalhe = ClubeResumo & {
  players: JogadorDoClube[];
};

export type OrdemClubes = 'name' | 'net_worth_asc' | 'net_worth_desc';

export type NovoClube = {
  name: string;
  acronym: string;
};

export const clubesApi = {
  listar(sort: OrdemClubes = 'name'): Promise<ClubeResumo[]> {
    return requisitar<ClubeResumo[]>('/clubs', { consulta: { sort } });
  },

  buscar(id: number): Promise<ClubeDetalhe> {
    return requisitar<ClubeDetalhe>(`/clubs/${id}`);
  },

  criar(dados: NovoClube): Promise<ClubeResumo> {
    return requisitar<ClubeResumo>('/clubs', { metodo: 'POST', corpo: dados });
  },
};
