import { ArrowUpDown, Search, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ErroApi } from '../../api/cliente';
import { Button } from '../../components/ui/button';
import { Select, type OpcaoSelect } from '../../components/ui/select';
import { CabecalhoPagina } from '../../components/compartilhados/cabecalho-pagina';
import { TabelaDados } from '../../components/compartilhados/tabela-dados';
import { useClubes } from '../../consultas/clubes';
import {
  useContagemJogadores,
  useListaJogadores,
} from '../../consultas/jogadores';
import { cn } from '../../lib/utils';
import { BarraFiltros, ChipsFiltros } from './barra-filtros';
import { colunasJogadores } from './tabela-jogadores';
import { Paginacao } from './paginacao';
import {
  filtrosAtivos,
  filtrosContagem,
  filtrosLista,
  escreverEstado,
  lerEstado,
  ROTULO_ORDEM,
  type AbaJogadores,
  type EstadoJogadores,
  type OrdemJogadores,
} from './filtros';

const ORDENS = Object.keys(ROTULO_ORDEM) as OrdemJogadores[];

const ROTULO_ABA: Record<AbaJogadores, string> = {
  todos: 'Todos',
  livres: 'Livres',
  clubes: 'Em clubes',
};

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    return erro.message;
  }
  return 'Não foi possível carregar os jogadores. Verifique a conexão e tente de novo.';
}

export function PaginaJogadores() {
  const [parametros, definirParametros] = useSearchParams();
  const estado = useMemo(() => lerEstado(parametros), [parametros]);
  const [buscaDigitada, setBuscaDigitada] = useState(estado.busca);

  const atualizar = useCallback(
    (alteracao: Partial<EstadoJogadores>) => {
      definirParametros(escreverEstado({ ...estado, pagina: 1, ...alteracao }));
    },
    [estado, definirParametros],
  );

  const limparTudo = () => definirParametros(new URLSearchParams());

  const [buscaDaUrl, setBuscaDaUrl] = useState(estado.busca);
  if (buscaDaUrl !== estado.busca) {
    setBuscaDaUrl(estado.busca);
    setBuscaDigitada(estado.busca);
  }

  useEffect(() => {
    const termo = buscaDigitada.trim();
    if (termo === estado.busca.trim()) return;
    const temporizador = window.setTimeout(
      () => atualizar({ busca: termo }),
      300,
    );
    return () => window.clearTimeout(temporizador);
  }, [buscaDigitada, estado.busca, atualizar]);

  const lista = useListaJogadores(
    useMemo(() => filtrosLista(estado), [estado]),
  );
  const contTodos = useContagemJogadores(
    useMemo(() => filtrosContagem(estado, 'todos'), [estado]),
  );
  const contLivres = useContagemJogadores(
    useMemo(() => filtrosContagem(estado, 'livres'), [estado]),
    estado.clube === undefined,
  );
  const contClubes = useContagemJogadores(
    useMemo(() => filtrosContagem(estado, 'clubes'), [estado]),
  );
  const clubes = useClubes();

  const listaClubes = useMemo(() => clubes.data ?? [], [clubes.data]);
  const clubesPorId = useMemo(
    () =>
      new Map(
        listaClubes.map((clube) => [
          clube.id,
          { name: clube.name, acronym: clube.acronym },
        ]),
      ),
    [listaClubes],
  );

  const contagemDaAba: Record<AbaJogadores, number | undefined> = {
    todos: contTodos.data,
    livres: estado.clube === undefined ? contLivres.data : undefined,
    clubes: contClubes.data,
  };
  const abaBloqueada = (aba: AbaJogadores) =>
    aba === 'livres' && estado.clube !== undefined;

  const opcoesOrdem: OpcaoSelect[] = ORDENS.map((ordem) => ({
    valor: ordem,
    rotulo: ROTULO_ORDEM[ordem],
  }));
  const estadoTabela = lista.isPending
    ? 'carregando'
    : lista.isError
      ? 'erro'
      : 'pronto';
  const total = lista.data?.meta.total_items ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        icone={Users}
        titulo="Jogadores"
        descricao="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
      />

      <BarraFiltros
        estado={estado}
        buscaDigitada={buscaDigitada}
        aoDigitarBusca={setBuscaDigitada}
        clubes={listaClubes}
        aoAlterar={atualizar}
      />

      <ChipsFiltros
        estado={estado}
        clubes={listaClubes}
        aoAlterar={atualizar}
        aoLimparTudo={limparTudo}
      />

      <div className="flex flex-col gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-b-0 border-border bg-card px-3 py-3">
          <div
            role="tablist"
            aria-label="Situação dos jogadores"
            className="inline-flex rounded-lg bg-muted p-1"
          >
            {(Object.keys(ROTULO_ABA) as AbaJogadores[]).map((aba) => {
              const ativa = estado.aba === aba;
              const bloqueada = abaBloqueada(aba);
              return (
                <button
                  key={aba}
                  type="button"
                  role="tab"
                  aria-selected={ativa}
                  disabled={bloqueada}
                  onClick={() => atualizar({ aba })}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors disabled:opacity-50',
                    ativa
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {ROTULO_ABA[aba]}
                  {contagemDaAba[aba] !== undefined && (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {contagemDaAba[aba]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Select
            ariaLabel="Ordenar jogadores"
            valor={estado.ordem}
            aoAlterar={(valor) => atualizar({ ordem: valor as OrdemJogadores })}
            opcoes={opcoesOrdem}
            textoTrigger={
              <span className="flex items-center gap-2">
                <ArrowUpDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {`Ordenar: ${ROTULO_ORDEM[estado.ordem].toLowerCase()}`}
              </span>
            }
          />
        </div>

        <TabelaDados
          colunas={colunasJogadores(clubesPorId)}
          linhas={lista.data?.data ?? []}
          chaveLinha={(jogador) => jogador.id}
          estado={estadoTabela}
          mensagemErro={mensagemDeErro(lista.error)}
          aoTentarNovamente={() => void lista.refetch()}
          vazio={
            filtrosAtivos(estado)
              ? {
                  icone: Search,
                  titulo: 'Nenhum jogador encontrado',
                  descricao:
                    'Confira a grafia ou tire alguns filtros. A busca ignora maiúsculas, minúsculas e acentos.',
                  acao: (
                    <Button variante="outline" onClick={limparTudo}>
                      Limpar filtros
                    </Button>
                  ),
                }
              : {
                  icone: Users,
                  titulo: 'Nenhum jogador cadastrado',
                  descricao: 'Com o banco recém-criado, a lista começa vazia.',
                }
          }
          rodape={
            lista.data && total > 0 ? (
              <Paginacao
                meta={lista.data.meta}
                aoMudarPagina={(pagina) => atualizar({ pagina })}
              />
            ) : undefined
          }
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Overall e valor de mercado são calculados a cada consulta. A busca
        ignora maiúsculas, minúsculas e acentos.
      </p>
    </div>
  );
}
