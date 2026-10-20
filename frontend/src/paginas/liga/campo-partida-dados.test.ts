import { describe, expect, it } from 'vitest';
import type { Duelo, PartidaDetalhe, ParticipanteDuelo } from '../../api/liga';
import { jogadoresNoCampo, posicionarNoCampo } from './campo-partida-dados';

const participante = (
  player_id: number,
  position: ParticipanteDuelo['position'],
  attribute: string,
  value: number,
  condition: ParticipanteDuelo['condition'] = 'APTO',
): ParticipanteDuelo => ({
  player_id,
  player_name: `Jogador ${player_id}`,
  position,
  condition,
  attribute,
  value,
});

const duelo = (
  order: number,
  attacking_club_id: number,
  attacker: ParticipanteDuelo,
  defender: ParticipanteDuelo,
  goal: boolean,
): Duelo => ({ order, attacking_club_id, attacker, defender, goal });

const partida: PartidaDetalhe = {
  id: 1,
  played_at: '2026-11-11T20:00:00-03:00',
  home: { club_id: 1, club_name: 'Delta FC', formation: '2-1-1', goals: 1 },
  away: { club_id: 2, club_name: 'Águias FC', formation: '2-1-1', goals: 0 },
  result: 'MANDANTE',
  duels: [
    duelo(
      1,
      1,
      participante(10, 'ATA', 'shooting', 81),
      participante(20, 'GOL', 'defending', 74),
      true,
    ),
    duelo(
      4,
      2,
      participante(30, 'ATA', 'shooting', 79),
      participante(40, 'GOL', 'defending', 77, 'MAL_CONDICIONADO'),
      false,
    ),
    duelo(
      5,
      2,
      participante(41, 'MEI', 'passing', 60),
      participante(11, 'ZAG', 'defending', 67),
      false,
    ),
  ],
};

describe('jogadoresNoCampo', () => {
  it('junta cada titular uma vez, com o atributo do ataque e a defesa', () => {
    const jogadores = jogadoresNoCampo(partida);
    const atacante = jogadores.find((j) => j.id === 10);
    expect(atacante).toMatchObject({
      mandante: true,
      gol: true,
      ataque: { sigla: 'Fin', valor: 81 },
      defesa: null,
    });
  });

  it('marca quem defende sem ataque e mantém a condição', () => {
    const jogadores = jogadoresNoCampo(partida);
    expect(jogadores.find((j) => j.id === 40)).toMatchObject({
      mandante: true,
      condicao: 'MAL_CONDICIONADO',
      ataque: null,
      defesa: 77,
    });
    expect(jogadores.find((j) => j.id === 11)).toMatchObject({
      mandante: true,
      defesa: 67,
    });
  });
});

describe('posicionarNoCampo', () => {
  it('espelha o visitante e separa os jogadores da mesma linha', () => {
    const posicoes = posicionarNoCampo(jogadoresNoCampo(partida));
    const goleiroMandante = posicoes.find((p) => p.jogador.id === 40);
    const goleiroVisitante = posicoes.find((p) => p.jogador.id === 20);
    expect(goleiroMandante?.x).toBe(6);
    expect(goleiroVisitante?.x).toBe(94);
    const ataques = posicoes.filter(
      (p) => p.jogador.mandante === false && p.jogador.posicao === 'ATA',
    );
    expect(ataques).toHaveLength(1);
    expect(ataques[0].y).toBe(50);
  });
});
