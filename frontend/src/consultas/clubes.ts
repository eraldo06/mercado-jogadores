import { useQuery } from '@tanstack/react-query';
import { clubesApi } from '../api/clubes';

export function useClubes() {
  return useQuery({
    queryKey: ['clubes'],
    queryFn: () => clubesApi.listar('name'),
  });
}
