import { z } from 'zod';

const MENSAGEM_IDADE = 'Use uma idade de 16 a 45 anos.';

export const faixaIdadeSchema = z
  .object({ minimo: z.string(), maximo: z.string() })
  .superRefine((valores, ctx) => {
    for (const campo of ['minimo', 'maximo'] as const) {
      const texto = valores[campo].trim();
      if (texto === '') continue;
      const numero = Number(texto);
      if (!/^\d+$/.test(texto) || numero < 16 || numero > 45) {
        ctx.addIssue({
          code: 'custom',
          message: MENSAGEM_IDADE,
          path: [campo],
        });
      }
    }
    const minimo = valores.minimo.trim();
    const maximo = valores.maximo.trim();
    if (
      /^\d+$/.test(minimo) &&
      /^\d+$/.test(maximo) &&
      Number(minimo) > Number(maximo)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'A idade mínima não pode ser maior que a máxima.',
        path: ['minimo'],
      });
    }
  });

export type ErrosFaixaIdade = Partial<Record<'minimo' | 'maximo', string>>;

export function validarFaixaIdade(
  minimo: string,
  maximo: string,
): {
  dados: { min?: number; max?: number } | null;
  erros: ErrosFaixaIdade;
} {
  const resultado = faixaIdadeSchema.safeParse({ minimo, maximo });
  if (!resultado.success) {
    const erros: ErrosFaixaIdade = {};
    for (const problema of resultado.error.issues) {
      const campo = problema.path[0] as 'minimo' | 'maximo';
      erros[campo] ??= problema.message;
    }
    return { dados: null, erros };
  }
  return {
    dados: {
      min: minimo.trim() === '' ? undefined : Number(minimo),
      max: maximo.trim() === '' ? undefined : Number(maximo),
    },
    erros: {},
  };
}
