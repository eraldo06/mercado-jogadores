import { ChevronRight, ListOrdered, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ErroApi } from '../../api/cliente';
import type { LinhaClassificacao } from '../../api/liga';
import { CabecalhoPagina } from '../../components/compartilhados/cabecalho-pagina';
import { EstadoErro } from '../../components/compartilhados/estado-erro';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useClubes } from '../../consultas/clubes';
import {
  useClassificacao,
  useCriarPartida,
  usePartidas,
} from '../../consultas/partidas';
import { dataHoraBrasilia } from '../../lib/formatar';
import { cn } from '../../lib/utils';
import { DialogNovaPartida } from './dialog-nova-partida';

// A API devolve a ordem final; a tela só exibe. Saldo com sinal: +2, −2, 0.
function saldoComSinal(saldo: number): string {
  if (saldo > 0) return `+${saldo}`;
  if (saldo < 0) return `−${Math.abs(saldo)}`;
  return '0';
}

const CRITERIOS = [
  'Mais pontos',
  'Maior saldo de gols',
  'Mais gols marcados',
  'Nome do clube, de A a Z',
];

function SiglaDoClube({ sigla }: { sigla: string }) {
  return (
    <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-medium">
      {sigla}
    </span>
  );
}

function LinhaDaTabela({
  linha,
  sigla,
}: {
  linha: LinhaClassificacao;
  sigla: string;
}) {
  const primeiro = linha.position === 1;
  const numero = (valor: number) => (
    <td className="px-3 py-3 text-right tabular-nums">{valor}</td>
  );
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-3">
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-md border text-sm font-medium tabular-nums',
            primeiro
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border',
          )}
        >
          {linha.position}
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="flex items-center gap-2">
          <SiglaDoClube sigla={sigla} />
          <Link
            to={`/clubes/${linha.club_id}`}
            className="font-medium underline underline-offset-2"
          >
            {linha.club_name}
          </Link>
        </span>
      </td>
      {numero(linha.played)}
      {numero(linha.wins)}
      {numero(linha.draws)}
      {numero(linha.losses)}
      {numero(linha.goals_for)}
      {numero(linha.goals_against)}
      <td className="px-3 py-3 text-right tabular-nums">
        {saldoComSinal(linha.goal_difference)}
      </td>
      <td className="px-3 py-3 text-right font-semibold tabular-nums">
        {linha.points}
      </td>
    </tr>
  );
}

export function PaginaClassificacao() {
  const navegar = useNavigate();
  const classificacao = useClassificacao();
  const clubes = useClubes();
  const partidas = usePartidas();
  const criar = useCriarPartida();
  const [novaAberta, setNovaAberta] = useState(false);

  const siglas = new Map(
    (clubes.data ?? []).map((c) => [c.id, c.acronym] as const),
  );
  const ultimas = (partidas.data ?? []).slice(0, 2);

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
        icone={ListOrdered}
        titulo="Classificação"
        descricao="Todos os clubes, com 3 pontos por vitória e 1 por empate."
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

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <section className="flex flex-col rounded-xl border border-border bg-card">
          {classificacao.isPending ? (
            <Skeleton className="h-96 w-full" />
          ) : classificacao.isError ? (
            <EstadoErro
              titulo="Não foi possível carregar a classificação"
              descricao={
                classificacao.error instanceof ErroApi
                  ? classificacao.error.message
                  : 'Verifique a conexão e tente de novo.'
              }
              aoTentarNovamente={() => void classificacao.refetch()}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Clube</th>
                      <th className="px-3 py-2 text-right font-medium">J</th>
                      <th className="px-3 py-2 text-right font-medium">V</th>
                      <th className="px-3 py-2 text-right font-medium">E</th>
                      <th className="px-3 py-2 text-right font-medium">D</th>
                      <th className="px-3 py-2 text-right font-medium">GP</th>
                      <th className="px-3 py-2 text-right font-medium">GC</th>
                      <th className="px-3 py-2 text-right font-medium">SG</th>
                      <th className="px-3 py-2 text-right font-medium">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classificacao.data.map((linha) => (
                      <LinhaDaTabela
                        key={linha.club_id}
                        linha={linha}
                        sigla={siglas.get(linha.club_id) ?? '—'}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols
                marcados · GC: gols sofridos · SG: saldo de gols · Pts: pontos
              </p>
            </>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold">Últimas partidas</h2>
              <p className="text-sm text-muted-foreground">
                Da mais recente para a mais antiga.
              </p>
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              {ultimas.map((p) => (
                <li key={p.id} className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {dataHoraBrasilia(p.played_at).replace(' ', ', ')}
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    {p.home.club_name}
                    <span className="rounded-md bg-muted px-2 py-0.5 tabular-nums">
                      {p.home.goals} × {p.away.goals}
                    </span>
                    {p.away.club_name}
                  </span>
                </li>
              ))}
              {ultimas.length === 0 && (
                <li className="text-muted-foreground">
                  Nenhuma partida jogada.
                </li>
              )}
            </ul>
            <Link
              to="/partidas"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Ver todas as partidas
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold">Ordem da tabela</h2>
              <p className="text-sm text-muted-foreground">
                Critérios de classificação, nesta ordem.
              </p>
            </div>
            <ol className="flex flex-col gap-2 text-sm">
              {CRITERIOS.map((criterio, indice) => (
                <li key={criterio} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {indice + 1}
                  </span>
                  {criterio}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      {classificacao.data && (
        <p className="text-xs text-muted-foreground">
          Classificação de 1 a {classificacao.data.length}, com os clubes sem
          partidas zerados. Pontos, saldo e posição são calculados a cada
          consulta, nunca gravados (RN21).
        </p>
      )}

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
