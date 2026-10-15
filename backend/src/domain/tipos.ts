export type Condicao = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';

export type Posicao = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';

export type Atributos = {
  velocidade: number;
  finalizacao: number;
  passe: number;
  drible: number;
  defesa: number;
  fisico: number;
};

export const CONDICOES: Condicao[] = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'];

export const POSICOES: Posicao[] = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];
