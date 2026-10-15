import { Clube, Contrato, Jogador } from '@prisma/client';
import {
  calcularDiasRestantes,
  calcularPercentualMulta,
} from '../domain/mercado/multa';
import { arredondarMoeda, decimal } from '../domain/arredondamento';
import { formatarDataBrasilia } from '../domain/data-brasilia';
import {
  JogadorResposta,
  toJogadorResposta,
} from '../players/jogador-resposta';

export type ClubeResumo = {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
};

export type ContratoResposta = {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
};

export type JogadorDoClubeResposta = JogadorResposta & {
  contract: ContratoResposta | null;
};

export type ClubeDetalhe = ClubeResumo & {
  players: JogadorDoClubeResposta[];
};

export function toClubeResumo(
  clube: Clube,
  jogadores: JogadorResposta[],
): ClubeResumo {
  const caixa = decimal(clube.caixa);
  const valorElenco = arredondarMoeda(
    jogadores.reduce(
      (total, jogador) => total.plus(jogador.market_value),
      decimal(0),
    ),
  );
  return {
    id: clube.id,
    name: clube.nome,
    acronym: clube.sigla,
    cash: caixa.toNumber(),
    squad_value: valorElenco.toNumber(),
    net_worth: arredondarMoeda(caixa.plus(valorElenco)).toNumber(),
  };
}

export function toContratoResposta(
  contrato: Contrato,
  momento: Date,
): ContratoResposta {
  const diasRestantes = calcularDiasRestantes(contrato.fidelidadeAte, momento);
  return {
    purchase_value: contrato.valorCompra.toNumber(),
    loyalty_until: formatarDataBrasilia(contrato.fidelidadeAte),
    remaining_days: diasRestantes,
    penalty_rate: calcularPercentualMulta(diasRestantes),
  };
}

export function toJogadorDoClube(
  jogador: Jogador,
  contrato: Contrato | undefined,
  momento: Date,
): JogadorDoClubeResposta {
  return {
    ...toJogadorResposta(jogador),
    contract: contrato ? toContratoResposta(contrato, momento) : null,
  };
}
