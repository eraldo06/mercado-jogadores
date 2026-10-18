import { useEnvioUnico } from '../lib/envio-unico';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { clubesApi, type NovoClube, type OrdemClubes } from '../api/clubes';
import { mercadoApi, type FiltrosHistorico } from '../api/mercado';

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
  return useEnvioUnico(
    useMutation({
      mutationFn: (dados: NovoClube) => clubesApi.criar(dados),
      onSuccess: () => {
        void cliente.invalidateQueries({ queryKey: ['clubes'] });
      },
    }),
  );
}

export function useVenderJogador() {
  const cliente = useQueryClient();
  return useEnvioUnico(
    useMutation({
      mutationFn: (jogadorId: number) => mercadoApi.vender(jogadorId),
      onSuccess: () => {
        void cliente.invalidateQueries({ queryKey: ['clubes'] });
        void cliente.invalidateQueries({ queryKey: ['jogadores'] });
        void cliente.invalidateQueries({ queryKey: ['escalacao'] });
        void cliente.invalidateQueries({ queryKey: ['transacoes'] });
      },
    }),
  );
}

export function useHistorico(clubeId: number, filtros: FiltrosHistorico) {
  return useQuery({
    queryKey: ['transacoes', clubeId, filtros],
    queryFn: () => mercadoApi.historico(clubeId, filtros),
    placeholderData: keepPreviousData,
  });
}
