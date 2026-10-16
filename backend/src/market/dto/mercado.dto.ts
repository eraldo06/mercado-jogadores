import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { LIMITE_ID } from '../../domain/texto';
import {
  DataBrasilia,
  InteiroTexto,
  TiposDeTransacao,
} from '../../common/validacao/validadores';

export class ComprarJogadorDto {
  @IsInt()
  @Min(1)
  @Max(LIMITE_ID)
  club_id!: number;

  @IsString()
  @DataBrasilia()
  loyalty_until!: string;
}

export class ListarTransacoesQuery {
  @IsOptional()
  @TiposDeTransacao()
  type?: string;

  @IsOptional()
  @InteiroTexto(1, LIMITE_ID)
  player_id?: string;
}
