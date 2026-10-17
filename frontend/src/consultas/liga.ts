import { useQuery } from '@tanstack/react-query';
import { ligaApi } from '../api/liga';

export function useEscalacao(clubeId: number | null, ativa = true) {
  return useQuery({
    queryKey: ['escalacao', clubeId],
    queryFn: () => ligaApi.escalacao(clubeId as number),
    enabled: ativa && clubeId !== null,
  });
}
