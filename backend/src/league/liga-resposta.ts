import type { Clube, DueloPartida, Jogador, Partida } from '@prisma/client';
import { formatarDataBrasilia } from '../domain/data-brasilia';
import type { LinhaClassificacao } from '../domain/liga/classificacao';
import type { Formacao } from '../domain/liga/escalacao';
import { Posicao } from '../domain/tipos';
import {
  JogadorResposta,
  toJogadorResposta,
} from '../players/jogador-resposta';

export type EscalacaoResposta = {
  club_id: number;
  formation: Formacao | null;
  complete: boolean;
  players: JogadorResposta[];
};

export type PartidaComClubes = Partida & { mandante: Clube; visitante: Clube };

export type PartidaComDuelos = PartidaComClubes & { duelos: DueloPartida[] };

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
  result: 'MANDANTE' | 'VISITANTE' | 'EMPATE';
};

export type DueloResposta = {
  order: number;
  attacking_club_id: number;
  attacker: {
    player_id: number;
    player_name: string;
    position: Posicao;
    condition: string;
    attribute: string;
    value: number;
  };
  defender: {
    player_id: number;
    player_name: string;
    position: Posicao;
    condition: string;
    attribute: string;
    value: number;
  };
  goal: boolean;
};

export type PartidaDetalhe = PartidaResumo & { duels: DueloResposta[] };

export type ClassificacaoResposta = {
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

export function toEscalacaoResposta(
  clubeId: number,
  formacao: Formacao | null,
  jogadores: Jogador[],
): EscalacaoResposta {
  return {
    club_id: clubeId,
    formation: formacao,
    complete: jogadores.length === 5,
    players: jogadores.map(toJogadorResposta),
  };
}

export function toPartidaResumo(partida: PartidaComClubes): PartidaResumo {
  const resultado =
    partida.golsMandante > partida.golsVisitante
      ? 'MANDANTE'
      : partida.golsVisitante > partida.golsMandante
        ? 'VISITANTE'
        : 'EMPATE';

  return {
    id: partida.id,
    played_at: formatarDataBrasilia(partida.jogadaEm),
    home: {
      club_id: partida.mandante.id,
      club_name: partida.mandante.nome,
      formation: partida.formacaoMandante as Formacao,
      goals: partida.golsMandante,
    },
    away: {
      club_id: partida.visitante.id,
      club_name: partida.visitante.nome,
      formation: partida.formacaoVisitante as Formacao,
      goals: partida.golsVisitante,
    },
    result: resultado,
  };
}

export function toPartidaDetalhe(partida: PartidaComDuelos): PartidaDetalhe {
  return {
    ...toPartidaResumo(partida),
    duels: [...partida.duelos]
      .sort((a, b) => a.ordem - b.ordem)
      .map((duelo) => ({
        order: duelo.ordem,
        attacking_club_id: duelo.clubeAtacanteId,
        attacker: {
          player_id: duelo.atacanteId,
          player_name: duelo.nomeAtacante,
          position: duelo.posicaoAtacante as Posicao,
          condition: duelo.condicaoAtacante,
          attribute: duelo.atributoAtaque,
          value: duelo.valorAtaque,
        },
        defender: {
          player_id: duelo.defensorId,
          player_name: duelo.nomeDefensor,
          position: duelo.posicaoDefensor as Posicao,
          condition: duelo.condicaoDefensor,
          attribute: duelo.atributoDefesa,
          value: duelo.valorDefesa,
        },
        goal: duelo.gol,
      })),
  };
}

export function toClassificacaoResposta(
  linha: LinhaClassificacao,
): ClassificacaoResposta {
  return {
    position: linha.posicao,
    club_id: linha.clubeId,
    club_name: linha.nome,
    played: linha.jogos,
    wins: linha.vitorias,
    draws: linha.empates,
    losses: linha.derrotas,
    goals_for: linha.golsPro,
    goals_against: linha.golsContra,
    goal_difference: linha.saldo,
    points: linha.pontos,
  };
}
