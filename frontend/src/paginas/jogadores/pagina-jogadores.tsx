import { ArrowUpDown, Plus, Search, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ErroApi } from '../../api/cliente';
import type { Jogador } from '../../api/jogadores';
import { CabecalhoPagina } from '../../components/compartilhados/cabecalho-pagina';
import { TabelaDados } from '../../components/compartilhados/tabela-dados';
import { Button } from '../../components/ui/button';
import { Select, type OpcaoSelect } from '../../components/ui/select';
import { useClubes } from '../../consultas/clubes';
import { useEscalacao } from '../../consultas/liga';
import {
  useAlterarCondicao,
  useComprarJogador,
  useContagemJogadores,
  useCriarJogador,
  useEditarJogador,
  useExcluirJogador,
  useListaJogadores,
} from '../../consultas/jogadores';
import type { CompraResposta } from '../../api/mercado';
import { cn } from '../../lib/utils';
import { BarraFiltros, ChipsFiltros } from './barra-filtros';
import { Alert } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { ConfirmacaoDialog } from '../../components/compartilhados/confirmacao-dialog';
import { DialogComprar } from './dialog-comprar';
import { DialogCondicao } from './dialog-condicao';
import { FormularioJogador } from './formulario-jogador';
import { JogadorCadastradoDialog } from './jogador-cadastrado-dialog';
import { ResultadoCompraDialog } from './resultado-compra-dialog';
import { Paginacao } from './paginacao';
import { colunasJogadores } from './tabela-jogadores';
import {
  escreverEstado,
  filtrosAtivos,
  filtrosContagem,
  filtrosLista,
  legendaJogadores,
  lerEstado,
  ROTULO_CONDICAO,
  ROTULO_ORDEM,
  ROTULO_POSICAO,
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

type FormularioAberto =
  { modo: 'criar' } | { modo: 'editar'; jogador: Jogador } | null;

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

  const [formulario, setFormulario] = useState<FormularioAberto>(null);
  const [condicaoDe, setCondicaoDe] = useState<Jogador | null>(null);
  const [cadastrado, setCadastrado] = useState<Jogador | null>(null);
  const [compraDe, setCompraDe] = useState<Jogador | null>(null);
  const [compraFeita, setCompraFeita] = useState<{
    resposta: CompraResposta;
    nomeDoClube: string;
  } | null>(null);
  const criar = useCriarJogador();
  const editar = useEditarJogador();
  const alterarCondicao = useAlterarCondicao();
  const comprar = useComprarJogador();
  const excluir = useExcluirJogador();
  const [excluirDe, setExcluirDe] = useState<Jogador | null>(null);
  const escalacaoDoClube = useEscalacao(
    condicaoDe?.club_id ?? null,
    condicaoDe !== null,
  );
  const titularDoClube =
    escalacaoDoClube.data?.players.some(
      (jogador) => jogador.id === condicaoDe?.id,
    ) ?? false;

  const abrirCriar = () => {
    criar.reset();
    setFormulario({ modo: 'criar' });
  };
  const abrirEditar = (jogador: Jogador) => {
    editar.reset();
    setFormulario({ modo: 'editar', jogador });
  };
  const abrirExcluir = (jogador: Jogador) => {
    excluir.reset();
    setExcluirDe(jogador);
  };
  const abrirCondicao = (jogador: Jogador) => {
    alterarCondicao.reset();
    setCondicaoDe(jogador);
  };
  const abrirComprar = (jogador: Jogador) => {
    comprar.reset();
    setCompraDe(jogador);
  };

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
        acao={
          <Button onClick={abrirCriar}>
            <Plus />
            Novo jogador
          </Button>
        }
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
          colunas={colunasJogadores(clubesPorId, {
            aoEditar: abrirEditar,
            aoAlterarCondicao: abrirCondicao,
            aoComprar: abrirComprar,
            aoExcluir: abrirExcluir,
          })}
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

      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        {legendaJogadores(estado, lista.data?.data[0]?.name).map((linha) => (
          <p key={linha}>{linha}</p>
        ))}
      </div>

      {formulario?.modo === 'criar' && (
        <FormularioJogador
          modo="criar"
          aberto
          aoFechar={() => setFormulario(null)}
          carregando={criar.isPending}
          erroApi={criar.error}
          aoSalvar={(dados) =>
            criar.mutate(dados, {
              onSuccess: (jogador) => {
                setFormulario(null);
                setCadastrado(jogador);
              },
            })
          }
        />
      )}

      {formulario?.modo === 'editar' && (
        <FormularioJogador
          key={formulario.jogador.id}
          modo="editar"
          aberto
          jogador={formulario.jogador}
          emClube={formulario.jogador.club_id !== null}
          aoFechar={() => setFormulario(null)}
          carregando={editar.isPending}
          erroApi={editar.error}
          aoSalvar={(dados) =>
            editar.mutate(
              { id: formulario.jogador.id, dados },
              {
                onSuccess: (jogador) => {
                  setFormulario(null);
                  toast.success('Jogador atualizado', {
                    description: `${jogador.name} foi atualizado.`,
                  });
                },
              },
            )
          }
        />
      )}

      {condicaoDe && (
        <DialogCondicao
          key={condicaoDe.id}
          aberto
          aoFechar={() => setCondicaoDe(null)}
          jogador={condicaoDe}
          nomeDoClube={
            condicaoDe.club_id === null
              ? undefined
              : clubesPorId.get(condicaoDe.club_id)?.name
          }
          titular={titularDoClube}
          carregando={alterarCondicao.isPending}
          erroApi={alterarCondicao.error}
          aoSalvar={(condicao) =>
            alterarCondicao.mutate(
              { id: condicaoDe.id, condicao },
              {
                onSuccess: (jogador) => {
                  setCondicaoDe(null);
                  toast.success('Condição alterada', {
                    description: `${jogador.name} agora está ${ROTULO_CONDICAO[jogador.condition]}.`,
                  });
                },
              },
            )
          }
        />
      )}

      {compraDe && (
        <DialogComprar
          key={compraDe.id}
          jogador={compraDe}
          clubes={listaClubes}
          aoFechar={() => setCompraDe(null)}
          carregando={comprar.isPending}
          erroApi={comprar.error}
          aoSalvar={(dados) =>
            comprar.mutate(
              { id: compraDe.id, dados },
              {
                onSuccess: (resposta) => {
                  setCompraDe(null);
                  setCompraFeita({
                    resposta,
                    nomeDoClube:
                      clubesPorId.get(dados.club_id)?.name ?? 'clube',
                  });
                },
              },
            )
          }
        />
      )}

      <ResultadoCompraDialog
        resposta={compraFeita?.resposta ?? null}
        nomeDoClube={compraFeita?.nomeDoClube ?? ''}
        aoFechar={() => setCompraFeita(null)}
      />

      {excluirDe && (
        <ConfirmacaoDialog
          key={excluirDe.id}
          aberto
          aoAlterarAbertura={(aberto) => !aberto && setExcluirDe(null)}
          titulo={`Excluir ${excluirDe.name}?`}
          descricao="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
          textoConfirmar="Excluir jogador"
          destrutiva
          carregando={excluir.isPending}
          aoConfirmar={() =>
            excluir.mutate(excluirDe.id, {
              onSuccess: () => {
                const nome = excluirDe.name;
                setExcluirDe(null);
                toast.success('Jogador excluído', {
                  description: `${nome} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
                });
              },
            })
          }
        >
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted-subtle p-3">
            <div className="flex flex-col">
              <span className="font-medium">{excluirDe.name}</span>
              <span className="text-xs text-muted-foreground">
                {excluirDe.position} · {ROTULO_POSICAO[excluirDe.position]} ·{' '}
                {excluirDe.age} anos
              </span>
            </div>
            <Badge>{excluirDe.club_id === null ? 'Livre' : 'Em clube'}</Badge>
          </div>
          {excluir.error && (
            <Alert
              variante="destrutivo"
              titulo="Não foi possível excluir o jogador"
            >
              {mensagemDeErro(excluir.error)}
            </Alert>
          )}
        </ConfirmacaoDialog>
      )}

      <JogadorCadastradoDialog
        jogador={cadastrado}
        aoFechar={() => setCadastrado(null)}
      />
    </div>
  );
}
