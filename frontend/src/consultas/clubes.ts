import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { clubesApi, type NovoClube, type OrdemClubes } from '../api/clubes';

export function useClubes() {
  return useQuery({
    queryKey: ['clubes'],
    queryFn: () => clubesApi.listar('name'),
  });
}

export function useListaClubes(ordem: OrdemClubes) {
  return useQuery({
    queryKey: ['clubes', 'lista', ordem],
    queryFn: () => clubesApi.listar(ordem),
    placeholderData: keepPreviousData,
  });
}

export function useClube(id: number) {
  return useQuery({
    queryKey: ['clubes', 'detalhe', id],
    queryFn: () => clubesApi.buscar(id),
  });
}

export function useCriarClube() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoClube) => clubesApi.criar(dados),
    onSuccess: () => {
      void cliente.invalidateQueries({ queryKey: ['clubes'] });
    },
  });
}
