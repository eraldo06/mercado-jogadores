import { useEnvioUnico } from '../lib/envio-unico';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ligaApi, type NovaEscalacao } from '../api/liga';

export function useEscalacao(clubeId: number | null, ativa = true) {
  return useQuery({
    queryKey: ['escalacao', clubeId],
    queryFn: () => ligaApi.escalacao(clubeId as number),
    enabled: ativa && clubeId !== null,
  });
}

export function useSalvarEscalacao(clubeId: number) {
  const cliente = useQueryClient();
  const atualizar = () => {
    void cliente.invalidateQueries({ queryKey: ['escalacao', clubeId] });
    void cliente.invalidateQueries({ queryKey: ['clubes'] });
  };
  return useEnvioUnico(
    useMutation({
      mutationFn: (dados: NovaEscalacao) =>
        ligaApi.salvarEscalacao(clubeId, dados),
      onSuccess: atualizar,
      onError: atualizar,
    }),
  );
}
