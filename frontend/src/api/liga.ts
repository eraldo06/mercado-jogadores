import { requisitar } from './cliente';
import type { Jogador } from './jogadores';
import type { Condicao, Formacao, Posicao, ResultadoPartida } from './tipos';

export type Escalacao = {
  club_id: number;
  formation: Formacao | null;
  complete: boolean;
  players: Jogador[];
};

export type NovaEscalacao = {
  formation: Formacao;
  player_ids: number[];
};

export type LadoPartida = {
  club_id: number;
  club_name: string;
  formation: Formacao;
  goals: number;
};

export type PartidaResumo = {
  id: number;
  played_at: string;
  home: LadoPartida;
  away: LadoPartida;
  result: ResultadoPartida;
};

export type ParticipanteDuelo = {
  player_id: number;
  player_name: string;
  position: Posicao;
  condition: Condicao;
  attribute: string;
  value: number;
};

export type Duelo = {
  order: number;
  attacking_club_id: number;
  attacker: ParticipanteDuelo;
  defender: ParticipanteDuelo;
  goal: boolean;
};

export type PartidaDetalhe = PartidaResumo & {
  duels: Duelo[];
};

export type LinhaClassificacao = {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
};

export type NovaPartida = {
  home_club_id: number;
  away_club_id: number;
};

export const ligaApi = {
  escalacao(clubId: number): Promise<Escalacao> {
    return requisitar<Escalacao>(`/clubs/${clubId}/lineup`);
  },

  salvarEscalacao(clubId: number, dados: NovaEscalacao): Promise<Escalacao> {
    return requisitar<Escalacao>(`/clubs/${clubId}/lineup`, {
      metodo: 'PUT',
      corpo: dados,
    });
  },

  partidas(clubId?: number): Promise<PartidaResumo[]> {
    return requisitar<PartidaResumo[]>('/matches', {
      consulta: { club_id: clubId },
    });
  },

  partida(id: number): Promise<PartidaDetalhe> {
    return requisitar<PartidaDetalhe>(`/matches/${id}`);
  },

  criarPartida(dados: NovaPartida): Promise<PartidaDetalhe> {
    return requisitar<PartidaDetalhe>('/matches', {
      metodo: 'POST',
      corpo: dados,
    });
  },

  classificacao(): Promise<LinhaClassificacao[]> {
    return requisitar<LinhaClassificacao[]>('/standings');
  },
};
