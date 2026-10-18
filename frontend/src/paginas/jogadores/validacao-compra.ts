import { z } from 'zod';
import type { NovaCompra } from '../../api/mercado';

export type ValoresCompra = { clube: string; data: string; hora: string };

export type ErrosCompra = Partial<Record<keyof ValoresCompra, string>>;

const DIAS_FIDELIDADE = 1095;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const MENSAGEM_CLUBE = 'Escolha o clube comprador.';
const MENSAGEM_DATA = 'Informe a data do fim da fidelidade.';
const MENSAGEM_HORA = 'Informe a hora do fim da fidelidade.';
const MENSAGEM_PERIODO = `Use um momento depois de agora e até ${DIAS_FIDELIDADE.toLocaleString('pt-BR')} dias.`;

function dataExiste(data: string): boolean {
  const [ano, mes, dia] = data.split('-').map(Number);
  const calendario = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    calendario.getUTCFullYear() === ano &&
    calendario.getUTCMonth() === mes - 1 &&
    calendario.getUTCDate() === dia
  );
}

const compraSchema = z
  .object({
    clube: z
      .string({ error: MENSAGEM_CLUBE })
      .min(1, { error: MENSAGEM_CLUBE }),
    data: z
      .string({ error: MENSAGEM_DATA })
      .min(1, { error: MENSAGEM_DATA })
      .refine((data) => /^\d{4}-\d{2}-\d{2}$/.test(data) && dataExiste(data), {
        error: 'Use uma data válida.',
      }),
    hora: z
      .string({ error: MENSAGEM_HORA })
      .min(1, { error: MENSAGEM_HORA })
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'Use uma hora válida.' }),
  })
  .superRefine((valores, ctx) => {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(valores.data) ||
      !dataExiste(valores.data)
    ) {
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(valores.hora)) {
      return;
    }
    const momento = new Date(
      `${valores.data}T${valores.hora}:00-03:00`,
    ).getTime();
    const agora = Date.now();
    if (momento <= agora || momento > agora + DIAS_FIDELIDADE * MS_POR_DIA) {
      ctx.addIssue({
        code: 'custom',
        message: MENSAGEM_PERIODO,
        path: ['data'],
      });
    }
  });

export function validarCompra(valores: ValoresCompra): {
  dados: NovaCompra | null;
  erros: ErrosCompra;
} {
  const resultado = compraSchema.safeParse(valores);
  if (!resultado.success) {
    const erros: ErrosCompra = {};
    for (const problema of resultado.error.issues) {
      const campo = problema.path[0] as keyof ValoresCompra | undefined;
      if (campo && !erros[campo]) {
        erros[campo] = problema.message;
      }
    }
    return { dados: null, erros };
  }
  return {
    dados: {
      club_id: Number(resultado.data.clube),
      loyalty_until: `${resultado.data.data}T${resultado.data.hora}-03:00`,
    },
    erros: {},
  };
}
