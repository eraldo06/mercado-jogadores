import { useQuery } from '@tanstack/react-query';
import { ligaApi } from '../api/liga';

export function usePartidas() {
  return useQuery({
    queryKey: ['partidas'],
    queryFn: () => ligaApi.partidas(),
  });
}
