import {
  AlertTriangle,
  BadgePercent,
  Check,
  Download,
  Handshake,
  History,
  ShoppingCart,
  TrendingDown,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { ErroApi } from '../../api/cliente';
import {
  mercadoApi,
  type FiltrosHistorico,
  type Transacao,
} from '../../api/mercado';
import type { TipoTransacao } from '../../api/tipos';
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import {
  TabelaDados,
  type ColunaTabela,
} from '../../components/compartilhados/tabela-dados';
import { Alert } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { useHistorico } from '../../consultas/clubes';
import { dataHoraBrasilia, moeda, moedaComSinal } from '../../lib/formatar';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const TIPOS: TipoTransacao[] = ['COMPRA', 'VENDA'];
const ROTULO_TIPO: Record<TipoTransacao, string> = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
};
const TODOS = 'todos';

function corDoValor(valor: number): string {
  if (valor > 0) return 'text-success';
  if (valor < 0) return 'text-destructive';
  return '';
}

function ChipTipo({
  tipo,
  marcado,
  aoAlternar,
}: {
  tipo: TipoTransacao;
  marcado: boolean;
  aoAlternar: () => void;
}) {
  const Icone = tipo === 'COMPRA' ? ShoppingCart : Handshake;
  return (
    <button
      type="button"
      aria-pressed={marcado}
      onClick={aoAlternar}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
        marcado
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-input bg-background text-foreground',
      )}
    >
      <span
        className={cn(
          'flex size-4 items-center justify-center rounded-sm border',
          marcado
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input',
        )}
        aria-hidden="true"
      >
        {marcado && <Check className="size-3" />}
      </span>
      <Icone className="size-4" aria-hidden="true" />
      {ROTULO_TIPO[tipo]}
    </button>
  );
}

const colunasHistorico: ColunaTabela<Transacao>[] = [
  {
    chave: 'data',
    titulo: 'Data e hora',
    render: (t) => (
      <span className="tabular-nums">{dataHoraBrasilia(t.created_at)}</span>
    ),
  },
  {
    chave: 'tipo',
    titulo: 'Tipo',
    render: (t) => (
      <Badge className="gap-1">
        {t.type === 'COMPRA' ? (
          <ShoppingCart className="size-3" aria-hidden="true" />
        ) : (
          <Handshake className="size-3" aria-hidden="true" />
        )}
        {ROTULO_TIPO[t.type]}
      </Badge>
    ),
  },
  {
    chave: 'jogador',
    titulo: 'Jogador',
    render: (t) => (
      <div className="flex items-center gap-2">
        <AvatarIniciais nome={t.player_name} chave={t.player_id} />
        <span className="whitespace-nowrap">{t.player_name}</span>
      </div>
    ),
  },
  {
    chave: 'valor',
    titulo: 'Valor',
    alinhamento: 'direita',
    render: (t) => <span className="tabular-nums">{moeda(t.value)}</span>,
  },
  {
    chave: 'taxa',
    titulo: 'Taxa ou comissão',
    alinhamento: 'direita',
    render: (t) => <span className="tabular-nums">{moeda(t.fee)}</span>,
  },
  {
    chave: 'multa',
    titulo: 'Multa',
    alinhamento: 'direita',
    render: (t) => (
      <span className="tabular-nums text-muted-foreground">
        {moeda(t.penalty)}
      </span>
    ),
  },
  {
    chave: 'lucro',
    titulo: 'Lucro',
    alinhamento: 'direita',
    render: (t) =>
      t.profit === null ? (
        <span className="text-muted-foreground">–</span>
      ) : (
        <span className={cn('tabular-nums', corDoValor(t.profit))}>
          {moedaComSinal(t.profit)}
        </span>
      ),
  },
  {
    chave: 'variacao',
    titulo: 'Variação do caixa',
    alinhamento: 'direita',
    render: (t) => (
      <span
        className={cn('font-medium tabular-nums', corDoValor(t.cash_change))}
      >
        {moedaComSinal(t.cash_change)}
      </span>
    ),
  },
];

type PropsHistorico = {
  clubeId: number;
};

export function HistoricoClube({ clubeId }: PropsHistorico) {
  const [tipos, setTipos] = useState<TipoTransacao[]>(TIPOS);
  const [jogadorId, setJogadorId] = useState<string>(TODOS);
  const [exportando, setExportando] = useState(false);

  const filtros: FiltrosHistorico = {
    type: tipos.length === TIPOS.length ? undefined : tipos,
    player_id: jogadorId === TODOS ? undefined : Number(jogadorId),
  };
  const historico = useHistorico(clubeId, filtros);
  const todas = useHistorico(clubeId, {});

  const jogadoresNoHistorico = [
    ...new Map(
      (todas.data?.data ?? []).map(
        (t) => [t.player_id, t.player_name] as const,
      ),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));

  const filtroRecusado =
    historico.error instanceof ErroApi &&
    historico.error.status === 404 &&
    jogadorId !== TODOS;
  const erroCarregamento = historico.isError && !filtroRecusado;
  const filtrosAtivos = tipos.length !== TIPOS.length || jogadorId !== TODOS;
  const semTransacoes =
    historico.data !== undefined && historico.data.data.length === 0;

  const alternarTipo = (tipo: TipoTransacao) => {
    const proximos = tipos.includes(tipo)
      ? tipos.filter((t) => t !== tipo)
      : TIPOS.filter((t) => t === tipo || tipos.includes(t));
    if (proximos.length > 0) setTipos(proximos);
  };

  const limparFiltros = () => {
    setTipos(TIPOS);
    setJogadorId(TODOS);
  };

  const exportar = async () => {
    if (exportando) return;
    setExportando(true);
    try {
      const csv = await mercadoApi.exportarCsv(clubeId, filtros);
      const url = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      );
      const arquivo = `historico-clube-${clubeId}.csv`;
      const link = document.createElement('a');
      link.href = url;
      link.download = arquivo;
      link.click();
      URL.revokeObjectURL(url);
      const descricao =
        tipos.length === 1
          ? `${arquivo}, com o filtro de tipo ${ROTULO_TIPO[tipos[0]]} aplicado.`
          : `${arquivo}, com os filtros da tela aplicados.`;
      toast.success('CSV baixado', { description: descricao });
    } catch (erro) {
      toast.error('Não foi possível exportar o CSV', {
        description:
          erro instanceof ErroApi
            ? erro.message
            : 'Verifique a conexão e tente de novo.',
        duration: Infinity,
      });
    } finally {
      setExportando(false);
    }
  };

  const resumo = historico.data?.summary;
  const estadoTabela = historico.isPending
    ? 'carregando'
    : erroCarregamento
      ? 'erro'
      : 'pronto';

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-0">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold">Histórico de transações</h2>
          <p className="text-sm text-muted-foreground">
            Da mais recente para a mais antiga, com o nome e os valores do
            momento de cada operação.
          </p>
        </div>
        <Button
          variante="outline"
          onClick={() => void exportar()}
          disabled={exportando}
          carregando={exportando}
        >
          {!exportando && <Download aria-hidden="true" />}
          {exportando ? 'Exportando…' : 'Exportar CSV'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4">
        <span className="text-sm text-muted-foreground">Tipo</span>
        {TIPOS.map((tipo) => (
          <ChipTipo
            key={tipo}
            tipo={tipo}
            marcado={tipos.includes(tipo)}
            aoAlternar={() => alternarTipo(tipo)}
          />
        ))}
        <Select
          ariaLabel="Filtrar por jogador"
          valor={jogadorId}
          aoAlterar={setJogadorId}
          opcoes={[
            { valor: TODOS, rotulo: 'Todos' },
            ...jogadoresNoHistorico.map(([id, nome]) => ({
              valor: String(id),
              rotulo: nome,
            })),
          ]}
          textoTrigger={
            <span className="flex items-center gap-2">
              <User
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              {jogadorId === TODOS
                ? 'Jogador: todos'
                : `Jogador: ${
                    jogadoresNoHistorico.find(
                      ([id]) => String(id) === jogadorId,
                    )?.[1] ?? ''
                  }`}
            </span>
          }
        />
        {filtrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {filtroRecusado ? (
        <div className="px-4 pb-4">
          <Alert variante="destrutivo" titulo="O filtro foi recusado">
            {historico.error instanceof ErroApi ? historico.error.message : ''}
          </Alert>
        </div>
      ) : (
        <>
          <TabelaDados
            colunas={colunasHistorico}
            linhas={historico.data?.data ?? []}
            chaveLinha={(t) => t.id}
            estado={estadoTabela}
            tituloErro="Não foi possível carregar o histórico"
            mensagemErro="Não foi possível carregar o histórico. Os totais e a exportação ficam indisponíveis até a lista carregar."
            aoTentarNovamente={() => void historico.refetch()}
            vazio={{
              icone: History,
              titulo: 'Nenhuma transação ainda',
              descricao:
                'As compras e vendas do clube aparecem aqui, com os totais logo abaixo.',
            }}
          />

          {resumo && (
            <div className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-5">
              <Total
                rotulo="Total pago em compras"
                nota="Valor + taxa"
                icone={ShoppingCart}
                valor={moeda(resumo.total_spent)}
              />
              <Total
                rotulo="Total recebido em vendas"
                nota="Crédito líquido"
                icone={Handshake}
                valor={moeda(resumo.total_received)}
              />
              <Total
                rotulo="Taxas e comissões"
                nota="Somadas"
                icone={BadgePercent}
                valor={moeda(resumo.total_fees)}
              />
              <Total
                rotulo="Multas"
                nota="Por fidelidade"
                icone={AlertTriangle}
                valor={moeda(resumo.total_penalties)}
              />
              <Total
                rotulo="Lucro total"
                nota="Soma dos lucros, com sinal"
                icone={TrendingDown}
                valor={moedaComSinal(resumo.total_profit)}
                cor={corDoValor(resumo.total_profit)}
              />
            </div>
          )}
        </>
      )}

      {!filtroRecusado && (
        <p className="px-4 pb-4 text-xs text-muted-foreground">
          {semTransacoes
            ? 'Sem transações, os totais ficam zerados. O botão Exportar CSV continua disponível e baixa só a linha de cabeçalho.'
            : tipos.length === 1
              ? `Com o filtro “${ROTULO_TIPO[tipos[0]]}”, os totais consideram só as ${tipos[0] === 'VENDA' ? 'vendas' : 'compras'} (total pago em compras ${moeda(resumo?.total_spent ?? 0)}). O CSV usa os mesmos filtros da tela.`
              : 'Os totais respeitam os filtros. O CSV usa os mesmos filtros da tela.'}
        </p>
      )}
    </section>
  );
}

function Total({
  rotulo,
  nota,
  icone: Icone,
  valor,
  cor,
}: {
  rotulo: string;
  nota: string;
  icone: typeof ShoppingCart;
  valor: string;
  cor?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border p-4 last:border-b-0 sm:border-r lg:border-b-0 lg:last:border-r-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icone className="size-4" aria-hidden="true" />
        {rotulo}
      </span>
      <span className={cn('text-xl font-semibold tabular-nums', cor)}>
        {valor}
      </span>
      <span className="text-xs text-muted-foreground">{nota}</span>
    </div>
  );
}
