import { arredondarMoeda, decimal } from '../arredondamento';

export type TransacaoResumida = {
  tipo: 'COMPRA' | 'VENDA';
  valor: number;
  taxa: number;
  multa: number;
  lucro: number | null;
  variacaoCaixa: number;
};

export type ResumoTransacoes = {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
};

export function calcularResumo(
  transacoes: TransacaoResumida[],
): ResumoTransacoes {
  const compras = transacoes.filter((t) => t.tipo === 'COMPRA');
  const vendas = transacoes.filter((t) => t.tipo === 'VENDA');
  const somar = (valores: (number | null)[]) =>
    arredondarMoeda(
      valores.reduce<ReturnType<typeof decimal>>(
        (total, valor) => total.plus(valor ?? 0),
        decimal(0),
      ),
    ).toNumber();

  return {
    total_spent: somar(
      compras.map((t) => decimal(t.valor).plus(t.taxa).toNumber()),
    ),
    total_received: somar(vendas.map((t) => t.variacaoCaixa)),
    total_fees: somar(transacoes.map((t) => t.taxa)),
    total_penalties: somar(vendas.map((t) => t.multa)),
    total_profit: somar(vendas.map((t) => t.lucro)),
  };
}
