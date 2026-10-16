import { decimal } from '../domain/arredondamento';
import { formatarDataBrasilia } from '../domain/data-brasilia';

export type LinhaCsv = {
  criadoEm: Date;
  tipo: string;
  nomeJogador: string;
  valor: number;
  taxa: number;
  multa: number;
  lucro: number | null;
  variacaoCaixa: number;
};

const CABECALHO =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

function valorCsv(valor: number | null): string {
  return valor === null ? '' : decimal(valor).toFixed(2).replace('.', ',');
}

function campoCsv(texto: string): string {
  return /[;"]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function gerarCsv(linhas: LinhaCsv[]): string {
  const corpo = linhas.map((linha) =>
    [
      formatarDataBrasilia(linha.criadoEm),
      linha.tipo,
      campoCsv(linha.nomeJogador),
      valorCsv(linha.valor),
      valorCsv(linha.taxa),
      valorCsv(linha.multa),
      valorCsv(linha.lucro),
      valorCsv(linha.variacaoCaixa),
    ].join(';'),
  );
  return [CABECALHO, ...corpo].map((linha) => `${linha}\n`).join('');
}
