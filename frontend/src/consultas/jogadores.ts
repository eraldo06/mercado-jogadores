import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { mercadoApi, type NovaCompra } from '../api/mercado';
import {
  jogadoresApi,
  type EdicaoJogador,
  type FiltrosJogadores,
  type NovoJogador,
} from '../api/jogadores';
import type { Condicao } from '../api/tipos';

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

function invalidarMercado(cliente: QueryClient) {
  void cliente.invalidateQueries({ queryKey: ['jogadores'] });
  void cliente.invalidateQueries({ queryKey: ['clubes'] });
  void cliente.invalidateQueries({ queryKey: ['escalacao'] });
}

export function useCriarJogador() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoJogador) => jogadoresApi.criar(dados),
    onSuccess: () => invalidarMercado(cliente),
  });
}

export function useEditarJogador() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: EdicaoJogador }) =>
      jogadoresApi.editar(id, dados),
    onSuccess: () => invalidarMercado(cliente),
  });
}

export function useAlterarCondicao() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, condicao }: { id: number; condicao: Condicao }) =>
      jogadoresApi.alterarCondicao(id, condicao),
    onSuccess: () => invalidarMercado(cliente),
  });
}

export function useComprarJogador() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: NovaCompra }) =>
      mercadoApi.comprar(id, dados),
    onSuccess: () => invalidarMercado(cliente),
  });
}

export function useExcluirJogador() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jogadoresApi.excluir(id),
    onSuccess: () => invalidarMercado(cliente),
  });
}
