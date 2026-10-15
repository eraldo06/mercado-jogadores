import { IsIn, IsOptional } from 'class-validator';
import { CONDICOES, POSICOES } from '../../domain/tipos';
import type { Condicao, Posicao } from '../../domain/tipos';
import { LIMITE_ID } from '../../domain/texto';
import {
  DecimalTexto,
  InteiroTexto,
  NormalizarEspacos,
  OrdenacaoJogador,
  TamanhoTexto,
} from '../../common/validacao/validadores';

export class ListarJogadoresQuery {
  @IsOptional()
  @NormalizarEspacos()
  @TamanhoTexto(2, 100)
  search?: string;

  @IsOptional()
  @IsIn(POSICOES)
  position?: Posicao;

  @IsOptional()
  @IsIn(CONDICOES)
  condition?: Condicao;

  @IsOptional()
  @IsIn(['true', 'false'])
  free?: 'true' | 'false';

  @IsOptional()
  @InteiroTexto(1, LIMITE_ID)
  club_id?: string;

  @IsOptional()
  @InteiroTexto(16, 45)
  min_age?: string;

  @IsOptional()
  @InteiroTexto(16, 45)
  max_age?: string;

  @IsOptional()
  @DecimalTexto(0, 550)
  min_value?: string;

  @IsOptional()
  @DecimalTexto(0, 550)
  max_value?: string;

  @IsOptional()
  @OrdenacaoJogador()
  sort?: string;

  @IsOptional()
  @InteiroTexto(1, LIMITE_ID)
  page?: string;

  @IsOptional()
  @InteiroTexto(1, 50)
  limit?: string;
}
