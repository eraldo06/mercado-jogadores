import { Prisma } from '@prisma/client';

export const decimal = (valor: Prisma.Decimal.Value): Prisma.Decimal =>
  new Prisma.Decimal(valor);

export const arredondarMoeda = (valor: Prisma.Decimal.Value): Prisma.Decimal =>
  decimal(valor).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

export const arredondarInteiro = (
  valor: Prisma.Decimal.Value,
): Prisma.Decimal =>
  decimal(valor).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
