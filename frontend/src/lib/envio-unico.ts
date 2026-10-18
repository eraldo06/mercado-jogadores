import { useRef } from 'react';
import type { MutateOptions, UseMutationResult } from '@tanstack/react-query';

// Ignora novo envio enquanto o anterior não termina, mesmo com dois cliques no mesmo instante.
export function useEnvioUnico<TData, TError, TVariables, TContext>(
  mutacao: UseMutationResult<TData, TError, TVariables, TContext>,
) {
  const emCurso = useRef(false);

  const mutate = (
    variaveis: TVariables,
    opcoes?: MutateOptions<TData, TError, TVariables, TContext>,
  ) => {
    if (emCurso.current) return;
    emCurso.current = true;
    mutacao.mutate(variaveis, {
      ...opcoes,
      onSettled: (...argumentos) => {
        emCurso.current = false;
        opcoes?.onSettled?.(...argumentos);
      },
    });
  };

  return { ...mutacao, mutate };
}
