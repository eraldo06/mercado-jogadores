import { z } from 'zod';

export const LIMITE_MOEDA = 550;

const FORMATO_MOEDA = /^\d{1,3}([.,]\d{1,2})?$/;

export function moedaParaNumero(texto: string): number {
  return Number(texto.trim().replace(',', '.'));
}

const MENSAGEM_FORMATO = 'Use um valor como 10 ou 10,50.';
const MENSAGEM_LIMITE = `Use um valor de 0 a ${LIMITE_MOEDA}.`;

export const faixaMoedaSchema = z
  .object({ minimo: z.string(), maximo: z.string() })
  .superRefine((valores, ctx) => {
    for (const campo of ['minimo', 'maximo'] as const) {
      const texto = valores[campo].trim();
      if (texto === '') continue;
      if (!FORMATO_MOEDA.test(texto)) {
        ctx.addIssue({
          code: 'custom',
          message: MENSAGEM_FORMATO,
          path: [campo],
        });
        continue;
      }
      const numero = moedaParaNumero(texto);
      if (numero < 0 || numero > LIMITE_MOEDA) {
        ctx.addIssue({
          code: 'custom',
          message: MENSAGEM_LIMITE,
          path: [campo],
        });
      }
    }
    const minimo = valores.minimo.trim();
    const maximo = valores.maximo.trim();
    if (
      minimo !== '' &&
      maximo !== '' &&
      FORMATO_MOEDA.test(minimo) &&
      FORMATO_MOEDA.test(maximo) &&
      moedaParaNumero(minimo) > moedaParaNumero(maximo)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'O valor mínimo não pode ser maior que o máximo.',
        path: ['minimo'],
      });
    }
  });

export type ErrosFaixaMoeda = Partial<Record<'minimo' | 'maximo', string>>;

export function validarFaixaMoeda(
  minimo: string,
  maximo: string,
): {
  dados: { min?: number; max?: number } | null;
  erros: ErrosFaixaMoeda;
} {
  const resultado = faixaMoedaSchema.safeParse({ minimo, maximo });
  if (!resultado.success) {
    const erros: ErrosFaixaMoeda = {};
    for (const problema of resultado.error.issues) {
      const campo = problema.path[0] as 'minimo' | 'maximo';
      erros[campo] ??= problema.message;
    }
    return { dados: null, erros };
  }
  return {
    dados: {
      min: minimo.trim() === '' ? undefined : moedaParaNumero(minimo),
      max: maximo.trim() === '' ? undefined : moedaParaNumero(maximo),
    },
    erros: {},
  };
}
