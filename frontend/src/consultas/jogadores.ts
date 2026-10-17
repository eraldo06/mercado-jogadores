import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { jogadoresApi, type FiltrosJogadores } from '../api/jogadores';

export function useListaJogadores(filtros: FiltrosJogadores) {
  return useQuery({
    queryKey: ['jogadores', 'lista', filtros],
    queryFn: () => jogadoresApi.listar(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useContagemJogadores(filtros: FiltrosJogadores, ativa = true) {
  return useQuery({
    queryKey: ['jogadores', 'contagem', filtros],
    queryFn: () => jogadoresApi.listar({ ...filtros, limit: 1 }),
    select: (dados) => dados.meta.total_items,
    enabled: ativa,
    placeholderData: keepPreviousData,
  });
}
