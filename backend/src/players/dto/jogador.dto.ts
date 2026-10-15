import { IsIn, IsInt, Max, Min } from 'class-validator';
import { CONDICOES, POSICOES } from '../../domain/tipos';
import type { Condicao, Posicao } from '../../domain/tipos';
import {
  NomeDeJogador,
  NormalizarEspacos,
  TamanhoTexto,
} from '../../common/validacao/validadores';

export class JogadorDto {
  @NormalizarEspacos()
  @TamanhoTexto(3, 100)
  @NomeDeJogador()
  name!: string;

  @IsIn(POSICOES)
  position!: Posicao;

  @IsInt()
  @Min(1)
  @Max(100)
  agility!: number;

  @IsInt()
  @Min(16)
  @Max(45)
  age!: number;
}

export class CreateJogadorDto extends JogadorDto {
  @IsInt()
  @Min(1)
  @Max(99)
  pace!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  shooting!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  passing!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  dribbling!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  defending!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  physical!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  potential!: number;
}

export class UpdateJogadorDto extends JogadorDto {}

export class UpdateCondicaoDto {
  @IsIn(CONDICOES)
  condition!: Condicao;
}
