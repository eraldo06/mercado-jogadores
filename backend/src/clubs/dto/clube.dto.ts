import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import {
  NomeDeClube,
  NormalizarEspacos,
  TamanhoTexto,
} from '../../common/validacao/validadores';

export class CreateClubeDto {
  @NormalizarEspacos()
  @TamanhoTexto(3, 60)
  @NomeDeClube()
  name!: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'acronym deve ter exatamente 3 letras maiúsculas de A a Z',
  })
  acronym!: string;
}

export class ListarClubesQuery {
  @IsOptional()
  @IsIn(['name', 'net_worth_asc', 'net_worth_desc'])
  sort?: 'name' | 'net_worth_asc' | 'net_worth_desc';
}
