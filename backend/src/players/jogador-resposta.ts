import { Jogador } from '@prisma/client';
import { calcularOverall } from '../domain/mercado/overall';
import { calcularValorMercado } from '../domain/mercado/valor-mercado';
import { Condicao, Posicao } from '../domain/tipos';

export type JogadorResposta = {
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

export function toJogadorResposta(jogador: Jogador): JogadorResposta {
  const posicao = jogador.posicao as Posicao;
  const condicao = jogador.condicao as Condicao;
  const baseValue = jogador.valorBase.toNumber();

  return {
    id: jogador.id,
    name: jogador.nome,
    position: posicao,
    agility: jogador.agilidade,
    age: jogador.idade,
    condition: condicao,
    base_value: baseValue,
    market_value: calcularValorMercado({
      valorBase: baseValue,
      condicao,
      agilidade: jogador.agilidade,
      idade: jogador.idade,
    }),
    pace: jogador.velocidade,
    shooting: jogador.finalizacao,
    passing: jogador.passe,
    dribbling: jogador.drible,
    defending: jogador.defesa,
    physical: jogador.fisico,
    potential: jogador.potencial,
    overall: calcularOverall(posicao, {
      velocidade: jogador.velocidade,
      finalizacao: jogador.finalizacao,
      passe: jogador.passe,
      drible: jogador.drible,
      defesa: jogador.defesa,
      fisico: jogador.fisico,
    }),
    club_id: jogador.clubeId,
  };
}
