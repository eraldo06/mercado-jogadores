import type { Jogador } from '@prisma/client';
import type { Titular } from '../domain/liga/placar';
import { Condicao, Posicao } from '../domain/tipos';

export function toTitular(jogador: Jogador): Titular {
  return {
    id: jogador.id,
    nome: jogador.nome,
    posicao: jogador.posicao as Posicao,
    condicao: jogador.condicao as Condicao,
    atributos: {
      velocidade: jogador.velocidade,
      finalizacao: jogador.finalizacao,
      passe: jogador.passe,
      drible: jogador.drible,
      defesa: jogador.defesa,
      fisico: jogador.fisico,
    },
  };
}
