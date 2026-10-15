import { Transform } from 'class-transformer';
import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import {
  contarCaracteres,
  contarPalavras,
  ehInteiroPositivo,
  normalizarEspacos,
  possuiControle,
} from '../../domain/texto';

const DECIMAL_COM_ATE_DUAS_CASAS = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;
const ORDENACOES_JOGADOR = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
];

export function NormalizarEspacos(): PropertyDecorator {
  return Transform(
    ({ value }: { value: unknown }) =>
      typeof value === 'string' ? normalizarEspacos(value) : value,
    { toClassOnly: true },
  );
}

export function TamanhoTexto(
  min: number,
  max: number,
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'tamanhoTexto',
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'string' &&
          contarCaracteres(valor) >= min &&
          contarCaracteres(valor) <= max,
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ter de ${min} a ${max} caracteres`,
      },
    },
    options,
  );
}

export function NomeDeJogador(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'nomeDeJogador',
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'string' &&
          !possuiControle(valor) &&
          !/[0-9]/.test(valor) &&
          contarPalavras(valor) >= 2,
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ter pelo menos duas palavras, sem dígitos e sem caracteres de controle`,
      },
    },
    options,
  );
}

export function InteiroTexto(
  min: number,
  max: number,
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'inteiroTexto',
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'string' &&
          ehInteiroPositivo(valor) &&
          Number(valor) >= min &&
          Number(valor) <= max,
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ser um inteiro de ${min} a ${max}`,
      },
    },
    options,
  );
}

export function DecimalTexto(
  min: number,
  max: number,
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'decimalTexto',
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'string' &&
          DECIMAL_COM_ATE_DUAS_CASAS.test(valor) &&
          Number(valor) >= min &&
          Number(valor) <= max,
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ser um decimal de ${min} a ${max}, com até 2 casas`,
      },
    },
    options,
  );
}

export function OrdenacaoJogador(
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'ordenacaoJogador',
      validator: {
        validate: (valor: unknown) => {
          if (typeof valor !== 'string') {
            return false;
          }
          const criterios = valor.split(',');
          return (
            criterios.length <= 2 &&
            new Set(criterios).size === criterios.length &&
            criterios.every((criterio) => ORDENACOES_JOGADOR.includes(criterio))
          );
        },
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} aceita até dois valores de ${ORDENACOES_JOGADOR.join(', ')}, separados por vírgula`,
      },
    },
    options,
  );
}
