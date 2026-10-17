export type Posicao = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';

export type Condicao = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';

export type Formacao = '3-1' | '2-2' | '2-1-1' | '1-2-1';

export type TipoTransacao = 'COMPRA' | 'VENDA';

export type ResultadoPartida = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export type Paginacao = {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
};
