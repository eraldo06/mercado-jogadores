import { z } from 'zod';
import type { Condicao } from '../../api/tipos';

const condicaoSchema = z.enum(['APTO', 'MAL_CONDICIONADO', 'DOENTE'], {
  error: 'Escolha uma condição.',
});

export function validarCondicao(
  atual: Condicao,
  escolhida: string,
): {
  condicao: Condicao | null;
  erro?: string;
} {
  const resultado = condicaoSchema.safeParse(escolhida);
  if (!resultado.success) {
    return { condicao: null, erro: 'Escolha uma condição.' };
  }
  if (atual === 'DOENTE' && resultado.data === 'APTO') {
    return { condicao: null, erro: 'De Doente não passa direto para Apto.' };
  }
  return { condicao: resultado.data };
}
