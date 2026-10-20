import { ChevronRight, Plus, Shield, Swords } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ErroApi } from '../../api/cliente';
import type { PartidaResumo } from '../../api/liga';
import { CabecalhoPagina } from '../../components/compartilhados/cabecalho-pagina';
import {
  TabelaDados,
  type ColunaTabela,
} from '../../components/compartilhados/tabela-dados';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { useClubes } from '../../consultas/clubes';
import { useCriarPartida, usePartidas } from '../../consultas/partidas';
import { dataHoraBrasilia } from '../../lib/formatar';
import { DialogNovaPartida } from './dialog-nova-partida';
import { ROTULO_RESULTADO } from './rotulos-partida';

const TODOS = 'todos';

function Placar({ partida }: { partida: PartidaResumo }) {
  return (
    <span className="rounded-md bg-muted px-3 py-1 font-semibold tabular-nums">
      {partida.home.goals} × {partida.away.goals}
    </span>
  );
}

export function PaginaPartidas() {
  const navegar = useNavigate();
  const [clubeFiltro, setClubeFiltro] = useState(TODOS);
  const clubes = useClubes();
  const lista = usePartidas(
    clubeFiltro === TODOS ? undefined : Number(clubeFiltro),
  );
  const criar = useCriarPartida();
  const [novaAberta, setNovaAberta] = useState(false);

  const partidas = lista.data ?? [];
  const ultima = partidas[0];
  const siglas = new Map(
    (clubes.data ?? []).map((c) => [c.id, c.acronym] as const),
  );
  const sigla = (id: number) => siglas.get(id) ?? '—';

  const colunas: ColunaTabela<PartidaResumo>[] = [
    {
      chave: 'data',
      titulo: 'Data e hora',
      render: (p) => (
        <span className="tabular-nums">{dataHoraBrasilia(p.played_at)}</span>
      ),
    },
    {
      chave: 'mandante',
      titulo: 'Mandante',
      alinhamento: 'direita',
      render: (p) => (
        <span className="flex items-center justify-end gap-2 whitespace-nowrap">
          <span className="font-medium">{p.home.club_name}</span>
          <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-medium">
            {sigla(p.home.club_id)}
          </span>
        </span>
      ),
    },
    {
      chave: 'placar',
      titulo: 'Placar',
      alinhamento: 'centro',
      render: (p) => <Placar partida={p} />,
    },
    {
      chave: 'visitante',
      titulo: 'Visitante',
      render: (p) => (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-medium">
            {sigla(p.away.club_id)}
          </span>
          <span className="font-medium">{p.away.club_name}</span>
        </span>
      ),
    },
    {
      chave: 'resultado',
      titulo: 'Resultado',
      render: (p) => (
        <Badge variante="neutro">{ROTULO_RESULTADO[p.result]}</Badge>
      ),
    },
    {
      chave: 'duelos',
      titulo: '',
      alinhamento: 'direita',
      render: (p) => (
        <Button asChild variante="ghost">
          <Link to={`/partidas/${p.id}`}>
            Ver duelos
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      ),
    },
  ];

  const enviar = (dados: { home_club_id: number; away_club_id: number }) => {
    criar.mutate(dados, {
      onSuccess: (partida) => {
        setNovaAberta(false);
        toast.success('Partida jogada', {
          description: `${partida.home.club_name} ${partida.home.goals} × ${partida.away.goals} ${partida.away.club_name}. Placar e duelos devolvidos pela API.`,
        });
        navegar(`/partidas/${partida.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        icone={Swords}
        titulo="Partidas"
        descricao="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        acao={
          <Button
            onClick={() => {
              criar.reset();
              setNovaAberta(true);
            }}
          >
            <Plus aria-hidden="true" />
            Nova partida
          </Button>
        }
      />

      {ultima && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm text-muted-foreground">Última partida</h2>
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-6">
            <div className="flex flex-1 flex-wrap items-center justify-center gap-6">
              <div className="flex flex-col items-end">
                <span className="font-semibold">{ultima.home.club_name}</span>
                <span className="text-xs text-muted-foreground">Mandante</span>
              </div>
              <span className="flex size-14 items-center justify-center rounded-xl border border-border bg-muted text-sm font-semibold">
                {sigla(ultima.home.club_id)}
              </span>
              <div className="flex flex-col items-center gap-2">
                <span className="rounded-md bg-muted px-4 py-2 text-2xl font-semibold tabular-nums">
                  {ultima.home.goals} × {ultima.away.goals}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {dataHoraBrasilia(ultima.played_at).replace(' ', ', ')}
                </span>
                <Badge variante="neutro">
                  {ROTULO_RESULTADO[ultima.result]}
                </Badge>
              </div>
              <span className="flex size-14 items-center justify-center rounded-xl border border-border bg-muted text-sm font-semibold">
                {sigla(ultima.away.club_id)}
              </span>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{ultima.away.club_name}</span>
                <span className="text-xs text-muted-foreground">Visitante</span>
              </div>
            </div>
            <Button asChild variante="outline">
              <Link to={`/partidas/${ultima.id}`}>
                Ver duelos
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold">Histórico de partidas</h2>
            <p className="text-sm text-muted-foreground">
              Da mais recente para a mais antiga.
            </p>
          </div>
          <Select
            ariaLabel="Filtrar por clube"
            valor={clubeFiltro}
            aoAlterar={setClubeFiltro}
            opcoes={[
              { valor: TODOS, rotulo: 'Todos' },
              ...(clubes.data ?? []).map((c) => ({
                valor: String(c.id),
                rotulo: c.name,
              })),
            ]}
            textoTrigger={
              <span className="flex items-center gap-2">
                <Shield
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {clubeFiltro === TODOS
                  ? 'Clube: todos'
                  : `Clube: ${(clubes.data ?? []).find((c) => String(c.id) === clubeFiltro)?.name ?? ''}`}
              </span>
            }
          />
        </div>
        <TabelaDados
          colunas={colunas}
          linhas={partidas}
          chaveLinha={(p) => p.id}
          estado={
            lista.isPending ? 'carregando' : lista.isError ? 'erro' : 'pronto'
          }
          tituloErro="Não foi possível carregar as partidas"
          mensagemErro={
            lista.error instanceof ErroApi
              ? lista.error.message
              : 'Não foi possível carregar os dados. Verifique a conexão e tente de novo.'
          }
          aoTentarNovamente={() => void lista.refetch()}
          vazio={{
            icone: Swords,
            titulo: 'Nenhuma partida jogada',
            descricao:
              'Escale os 5 titulares de dois clubes e jogue a primeira partida. O resultado aparece aqui e na classificação.',
            acao: (
              <Button variante="outline" onClick={() => setNovaAberta(true)}>
                <Plus />
                Nova partida
              </Button>
            ),
          }}
        />
        {partidas.length > 0 && (
          <p className="px-4 pb-4 text-sm text-muted-foreground">
            {partidas.length} {partidas.length === 1 ? 'partida' : 'partidas'}
          </p>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        {lista.isSuccess && partidas.length === 0
          ? 'Nenhuma partida jogada ainda. A classificação continua com todos os clubes, zerados.'
          : 'Partidas da mais recente para a mais antiga, com filtro por clube. “Ver duelos” abre a partida.'}
      </p>

      {novaAberta && (
        <DialogNovaPartida
          clubes={clubes.data ?? []}
          carregando={criar.isPending}
          erroApi={criar.error}
          aoFechar={() => setNovaAberta(false)}
          aoSalvar={enviar}
        />
      )}
    </div>
  );
}
