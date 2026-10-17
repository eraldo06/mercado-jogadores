import { requisitarTexto, requisitar } from './cliente';
import type { TipoTransacao } from './tipos';

export type Transacao = {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TipoTransacao;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
};

export type ResumoHistorico = {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
};

export type HistoricoTransacoes = {
  data: Transacao[];
  summary: ResumoHistorico;
};

export type CompraResposta = Transacao & {
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: 'ATIVO';
  };
  club_cash: number;
};

export type VendaResposta = Transacao & {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: 'RESCINDIDO' | 'ENCERRADO';
  club_cash: number;
};

export type NovaCompra = {
  club_id: number;
  loyalty_until: string;
};

export type FiltrosHistorico = {
  type?: TipoTransacao[];
  player_id?: number;
};

function consultaDoHistorico(filtros: FiltrosHistorico) {
  return {
    type: filtros.type?.join(','),
    player_id: filtros.player_id,
  };
}

export const mercadoApi = {
  comprar(jogadorId: number, dados: NovaCompra): Promise<CompraResposta> {
    return requisitar<CompraResposta>(`/players/${jogadorId}/buy`, {
      metodo: 'POST',
      corpo: dados,
    });
  },

  vender(jogadorId: number): Promise<VendaResposta> {
    return requisitar<VendaResposta>(`/players/${jogadorId}/sell`, {
      metodo: 'POST',
    });
  },

  historico(
    clubId: number,
    filtros: FiltrosHistorico = {},
  ): Promise<HistoricoTransacoes> {
    return requisitar<HistoricoTransacoes>(`/clubs/${clubId}/transactions`, {
      consulta: consultaDoHistorico(filtros),
    });
  },

  exportarCsv(clubId: number, filtros: FiltrosHistorico = {}): Promise<string> {
    return requisitarTexto(`/clubs/${clubId}/transactions/export`, {
      consulta: consultaDoHistorico(filtros),
    });
  },
};
