import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { FORMACOES } from '../../domain/liga/escalacao';
import type { Formacao } from '../../domain/liga/escalacao';
import { LIMITE_ID } from '../../domain/texto';
import { InteiroTexto } from '../../common/validacao/validadores';

export class EscalarDto {
  @IsIn(FORMACOES, {
    message: 'formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1',
  })
  formation!: Formacao;

  @IsArray({ message: 'player_ids deve ser uma lista' })
  @ArrayMinSize(5, { message: 'player_ids deve ter exatamente 5 ids' })
  @ArrayMaxSize(5, { message: 'player_ids deve ter exatamente 5 ids' })
  @ArrayUnique({ message: 'player_ids não pode repetir ids' })
  @IsInt({ each: true, message: 'cada id de player_ids deve ser inteiro' })
  @Min(1, { each: true, message: 'cada id de player_ids deve ser positivo' })
  @Max(LIMITE_ID, {
    each: true,
    message: 'cada id de player_ids é grande demais',
  })
  player_ids!: number[];
}

export class CriarPartidaDto {
  @IsInt({ message: 'home_club_id deve ser um inteiro' })
  @Min(1, { message: 'home_club_id deve ser positivo' })
  @Max(LIMITE_ID, { message: 'home_club_id é grande demais' })
  home_club_id!: number;

  @IsInt({ message: 'away_club_id deve ser um inteiro' })
  @Min(1, { message: 'away_club_id deve ser positivo' })
  @Max(LIMITE_ID, { message: 'away_club_id é grande demais' })
  away_club_id!: number;
}

export class ListarPartidasQuery {
  @IsOptional()
  @InteiroTexto(1, LIMITE_ID)
  club_id?: string;
}
