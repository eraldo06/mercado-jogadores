import { z } from 'zod';
import type { NovaPartida } from '../../api/liga';

export type ValoresPartida = { mandante: string; visitante: string };
export type ErrosPartida = Partial<Record<keyof ValoresPartida, string>>;

const partidaSchema = z
  .object({
    mandante: z.string().min(1, { error: 'Escolha o clube mandante.' }),
    visitante: z.string().min(1, { error: 'Escolha o clube visitante.' }),
  })
  .superRefine((valores, ctx) => {
    if (valores.mandante !== '' && valores.mandante === valores.visitante) {
      ctx.addIssue({
        code: 'custom',
        message: 'Precisa ser um clube diferente do mandante.',
        path: ['visitante'],
      });
    }
  });

export function validarPartida(valores: ValoresPartida): {
  dados: NovaPartida | null;
  erros: ErrosPartida;
} {
  const resultado = partidaSchema.safeParse(valores);
  if (!resultado.success) {
    const erros: ErrosPartida = {};
    for (const problema of resultado.error.issues) {
      const campo = problema.path[0] as keyof ValoresPartida;
      erros[campo] ??= problema.message;
    }
    return { dados: null, erros };
  }
  return {
    dados: {
      home_club_id: Number(resultado.data.mandante),
      away_club_id: Number(resultado.data.visitante),
    },
    erros: {},
  };
}
