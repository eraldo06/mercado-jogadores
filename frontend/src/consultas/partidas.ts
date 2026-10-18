import { useEnvioUnico } from '../lib/envio-unico';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ligaApi, type NovaPartida } from '../api/liga';

export function usePartidas(clubeId?: number) {
  return useQuery({
    queryKey: ['partidas', clubeId ?? 'todas'],
    queryFn: () => ligaApi.partidas(clubeId),
  });
}

export function usePartida(id: number) {
  return useQuery({
    queryKey: ['partidas', 'detalhe', id],
    queryFn: () => ligaApi.partida(id),
  });
}

export function useCriarPartida() {
  const cliente = useQueryClient();
  return useEnvioUnico(
    useMutation({
      mutationFn: (dados: NovaPartida) => ligaApi.criarPartida(dados),
      onSuccess: () => {
        void cliente.invalidateQueries({ queryKey: ['partidas'] });
        void cliente.invalidateQueries({ queryKey: ['clubes'] });
        void cliente.invalidateQueries({ queryKey: ['classificacao'] });
      },
    }),
  );
}

export function useClassificacao() {
  return useQuery({
    queryKey: ['classificacao'],
    queryFn: () => ligaApi.classificacao(),
  });
}
