import {
  CircleDollarSign,
  ClipboardList,
  History,
  Handshake,
  Landmark,
  ShoppingCart,
  Shirt,
  Wallet,
  ChevronLeft,
  Users,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ErroApi } from '../../api/cliente';
import type { JogadorDoClube } from '../../api/clubes';
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import { BadgeMulta } from '../../components/compartilhados/badge-multa';
import { CabecalhoPagina } from '../../components/compartilhados/cabecalho-pagina';
import { CondicaoBadge } from '../../components/compartilhados/condicao-badge';
import { EstadoErro } from '../../components/compartilhados/estado-erro';
import { EstadoVazio } from '../../components/compartilhados/estado-vazio';
import {
  TabelaDados,
  type ColunaTabela,
} from '../../components/compartilhados/tabela-dados';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import {
  useClube,
  useHistorico,
  useVenderJogador,
} from '../../consultas/clubes';
import { useEscalacao } from '../../consultas/liga';
import { dataHoraBrasilia, inteiro, moeda } from '../../lib/formatar';
import { ROTULO_POSICAO } from '../jogadores/filtros';
import { EscalacaoClube } from './escalacao-clube';
import { HistoricoClube } from './historico-clube';
import { DialogVender } from './dialog-vender';
import {
  ResultadoVendaDialog,
  type ResultadoVenda,
} from './resultado-venda-dialog';

const LIMITE_ELENCO = 12;

function criarColunasElenco(
  aoVender: (jogador: JogadorDoClube) => void,
): ColunaTabela<JogadorDoClube>[] {
  return [
    {
      chave: 'jogador',
      titulo: 'Jogador',
      render: (jogador) => (
        <div className="flex items-center gap-3">
          <AvatarIniciais nome={jogador.name} chave={jogador.id} />
          <div className="flex flex-col">
            <span className="font-medium whitespace-nowrap">
              {jogador.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {ROTULO_POSICAO[jogador.position]}
            </span>
          </div>
        </div>
      ),
    },
    {
      chave: 'posicao',
      titulo: 'Posição',
      render: (jogador) => (
        <Badge className="font-mono">{jogador.position}</Badge>
      ),
    },
    {
      chave: 'overall',
      titulo: 'Overall',
      alinhamento: 'direita',
      render: (jogador) => (
        <span className="font-semibold tabular-nums">{jogador.overall}</span>
      ),
    },
    {
      chave: 'condicao',
      titulo: 'Condição',
      render: (jogador) => <CondicaoBadge condicao={jogador.condition} />,
    },
    {
      chave: 'valorMercado',
      titulo: 'Valor de mercado',
      alinhamento: 'direita',
      render: (jogador) => (
        <span className="font-semibold tabular-nums">
          {moeda(jogador.market_value)}
        </span>
      ),
    },
    {
      chave: 'valorCompra',
      titulo: 'Valor de compra',
      alinhamento: 'direita',
      render: (jogador) =>
        jogador.contract ? (
          <span className="text-muted-foreground tabular-nums">
            {moeda(jogador.contract.purchase_value)}
          </span>
        ) : (
          '—'
        ),
    },
    {
      chave: 'fidelidade',
      titulo: 'Fim da fidelidade',
      render: (jogador) =>
        jogador.contract ? (
          <span className="tabular-nums">
            {dataHoraBrasilia(jogador.contract.loyalty_until)}
          </span>
        ) : (
          '—'
        ),
    },
    {
      chave: 'diasRestantes',
      titulo: 'Dias restantes',
      alinhamento: 'direita',
      render: (jogador) =>
        jogador.contract ? (
          <span className="tabular-nums">
            {inteiro(jogador.contract.remaining_days)}
          </span>
        ) : (
          '—'
        ),
    },
    {
      chave: 'multa',
      titulo: '% de multa',
      render: (jogador) =>
        jogador.contract ? (
          <BadgeMulta percentual={jogador.contract.penalty_rate} />
        ) : (
          '—'
        ),
    },
    {
      chave: 'acoes',
      titulo: '',
      alinhamento: 'direita',
      render: (jogador) =>
        jogador.contract ? (
          <Button variante="outline" onClick={() => aoVender(jogador)}>
            <Handshake aria-hidden="true" />
            Vender
          </Button>
        ) : (
          '—'
        ),
    },
  ];
}

type PropsIndicador = {
  rotulo: string;
  icone: typeof Wallet;
  valor: ReactNode;
  unidade?: string;
  ajuda: string;
};

function Indicador({
  rotulo,
  icone: Icone,
  valor,
  unidade,
  ajuda,
}: PropsIndicador) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {rotulo}
        <Icone className="size-4" aria-hidden="true" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{valor}</span>
        {unidade && (
          <span className="text-sm text-muted-foreground">{unidade}</span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{ajuda}</span>
    </div>
  );
}

type PropsAbaClube = {
  ativa: boolean;
  rotulo: string;
  icone: typeof Shirt;
  contagem: number | undefined;
  aoClicar: () => void;
};

function AbaClube({
  ativa,
  rotulo,
  icone: Icone,
  contagem,
  aoClicar,
}: PropsAbaClube) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={aoClicar}
      className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
        ativa
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icone className="size-4" aria-hidden="true" />
      {rotulo}
      {contagem !== undefined && (
        <span className="rounded-full bg-muted px-2 text-xs tabular-nums">
          {contagem}
        </span>
      )}
    </button>
  );
}

export function PaginaClube() {
  const { id } = useParams();
  const clubeId = Number(id);
  const consulta = useClube(clubeId);
  const escalacao = useEscalacao(clubeId);
  const vender = useVenderJogador();
  const [parametros, definirParametros] = useSearchParams();
  const abaParametro = parametros.get('aba');
  const abaAtiva =
    abaParametro === 'historico' || abaParametro === 'escalacao'
      ? abaParametro
      : 'elenco';
  const historicoTodas = useHistorico(clubeId, {});
  const [vendaDe, setVendaDe] = useState<JogadorDoClube | null>(null);
  const [resultadoVenda, setResultadoVenda] = useState<ResultadoVenda | null>(
    null,
  );

  if (
    consulta.isError &&
    consulta.error instanceof ErroApi &&
    consulta.error.status === 404
  ) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="font-semibold">Clube não encontrado</p>
        <p className="max-w-md text-sm text-muted-foreground">
          O endereço pode estar errado ou o clube não existe.
        </p>
        <Button asChild variante="outline">
          <Link to="/clubes">
            <ChevronLeft />
            Voltar para clubes
          </Link>
        </Button>
      </div>
    );
  }

  if (consulta.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-12 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, indice) => (
            <Skeleton key={indice} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (consulta.isError) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EstadoErro
          titulo="Não foi possível carregar o clube"
          descricao="Verifique a conexão e tente de novo."
          aoTentarNovamente={() => void consulta.refetch()}
        />
      </div>
    );
  }

  const clube = consulta.data;
  const jogadores = clube.players;
  const titularVenda =
    vendaDe !== null &&
    (escalacao.data?.players.some((jogador) => jogador.id === vendaDe.id) ??
      false);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        icone={Shirt}
        titulo={clube.name}
        descricao={undefined}
        acao={
          <Button asChild>
            <Link to="/jogadores?aba=livres">
              <ShoppingCart />
              Comprar jogadores
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge>Sigla {clube.acronym}</Badge>
        <Badge>
          {jogadores.length} de {LIMITE_ELENCO} jogadores
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador
          rotulo="Caixa"
          icone={Wallet}
          valor={moeda(clube.cash)}
          unidade="moedas"
          ajuda="Só muda por compras e vendas"
        />
        <Indicador
          rotulo="Valor do elenco"
          icone={CircleDollarSign}
          valor={moeda(clube.squad_value)}
          unidade="moedas"
          ajuda="Soma dos valores de mercado"
        />
        <Indicador
          rotulo="Patrimônio"
          icone={Landmark}
          valor={moeda(clube.net_worth)}
          unidade="moedas"
          ajuda="Caixa + valor do elenco"
        />
        <Indicador
          rotulo="Elenco"
          icone={Shirt}
          valor={`${jogadores.length} de ${LIMITE_ELENCO}`}
          ajuda={`Limite de ${LIMITE_ELENCO} jogadores`}
        />
      </div>

      <div
        role="tablist"
        aria-label="Seções do clube"
        className="flex gap-4 overflow-x-auto border-b border-border md:gap-6"
      >
        <AbaClube
          ativa={abaAtiva === 'elenco'}
          rotulo="Elenco"
          icone={Shirt}
          contagem={jogadores.length}
          aoClicar={() => definirParametros({})}
        />
        <AbaClube
          ativa={abaAtiva === 'escalacao'}
          rotulo="Escalação"
          icone={ClipboardList}
          contagem={undefined}
          aoClicar={() => definirParametros({ aba: 'escalacao' })}
        />
        <AbaClube
          ativa={abaAtiva === 'historico'}
          rotulo="Histórico"
          icone={History}
          contagem={historicoTodas.data?.data.length}
          aoClicar={() => definirParametros({ aba: 'historico' })}
        />
      </div>

      {abaAtiva === 'elenco' && jogadores.length === 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <EstadoVazio
            icone={Shirt}
            titulo="Nenhum jogador no elenco"
            descricao="Compre jogadores livres para montar o elenco. O limite é de 12 jogadores, e o custo de cada compra não pode passar de 50% do caixa."
            acao={
              <Button variante="outline" asChild>
                <Link to="/jogadores?aba=livres">
                  <Users />
                  Ver jogadores livres
                </Link>
              </Button>
            }
          />
        </div>
      )}

      {abaAtiva === 'elenco' && jogadores.length > 0 && (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold">Elenco</h2>
              <p className="text-sm text-muted-foreground">
                Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome.
                Contrato calculado para uma venda agora.
              </p>
            </div>
            <TabelaDados
              colunas={criarColunasElenco((jogador) => {
                vender.reset();
                setVendaDe(jogador);
              })}
              linhas={jogadores}
              chaveLinha={(jogador) => jogador.id}
              estado="pronto"
              vazio={{
                icone: Shirt,
                titulo: 'Nenhum jogador no elenco',
              }}
            />
          </section>

          <p className="text-xs text-muted-foreground">
            Valor de mercado, dias restantes e % de multa calculados para uma
            venda agora. A multa tem teto de 10,00.
          </p>
        </>
      )}

      {abaAtiva === 'escalacao' &&
        (escalacao.data ? (
          <EscalacaoClube
            clubeId={clubeId}
            nomeDoClube={clube.name}
            escalacao={escalacao.data}
            jogadores={jogadores}
          />
        ) : (
          <Skeleton className="h-96 w-full" />
        ))}

      {abaAtiva === 'historico' && <HistoricoClube clubeId={clubeId} />}

      {vendaDe && (
        <DialogVender
          key={vendaDe.id}
          jogador={vendaDe}
          nomeDoClube={clube.name}
          titular={titularVenda}
          carregando={vender.isPending}
          erroApi={vender.error}
          aoFechar={() => setVendaDe(null)}
          aoConfirmar={() =>
            vender.mutate(vendaDe.id, {
              onSuccess: (resposta) => {
                setVendaDe(null);
                setResultadoVenda({ resposta, titular: titularVenda });
              },
            })
          }
        />
      )}

      <ResultadoVendaDialog
        resultado={resultadoVenda}
        nomeDoClube={clube.name}
        aoFechar={() => setResultadoVenda(null)}
      />
    </div>
  );
}
