import { z } from 'zod';
import type { Formacao } from '../../api/tipos';

const FORMACOES = [
  '3-1',
  '2-2',
  '2-1-1',
  '1-2-1',
] as const satisfies readonly Formacao[];

export const escalacaoSchema = z
  .object({
    formacao: z.enum(FORMACOES, { error: 'Escolha uma formação.' }),
    titulares: z
      .array(z.number().int().positive(), { error: 'Escolha os 5 titulares.' })
      .length(5, { error: 'Escolha os 5 titulares.' }),
  })
  .refine(
    (valores) => new Set(valores.titulares).size === valores.titulares.length,
    {
      error: 'Um jogador não pode ocupar duas vagas.',
      path: ['titulares'],
    },
  );

export function escalacaoValida(
  formacao: Formacao,
  titulares: (number | null)[],
): boolean {
  if (titulares.some((id) => id === null)) return false;
  return escalacaoSchema.safeParse({ formacao, titulares }).success;
}
