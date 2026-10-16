import { Transacao } from '@prisma/client';
import { formatarDataBrasilia } from '../domain/data-brasilia';

export type TransacaoResposta = {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'COMPRA' | 'VENDA';
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
};

export function toTransacaoResposta(transacao: Transacao): TransacaoResposta {
  return {
    id: transacao.id,
    club_id: transacao.clubeId,
    player_id: transacao.jogadorId,
    player_name: transacao.nomeJogador,
    type: transacao.tipo as TransacaoResposta['type'],
    value: transacao.valor.toNumber(),
    fee: transacao.taxa.toNumber(),
    penalty: transacao.multa.toNumber(),
    profit: transacao.lucro?.toNumber() ?? null,
    cash_change: transacao.variacaoCaixa.toNumber(),
    created_at: formatarDataBrasilia(transacao.criadoEm),
  };
}
