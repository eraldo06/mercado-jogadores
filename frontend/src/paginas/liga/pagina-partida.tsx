import { ArrowLeft, CircleDot, Minus } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ErroApi } from '../../api/cliente';
import type { Duelo, LadoPartida, ParticipanteDuelo } from '../../api/liga';

type LadoComSigla = LadoPartida & { sigla: string };
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import { CondicaoBadge } from '../../components/compartilhados/condicao-badge';
import { EstadoErro } from '../../components/compartilhados/estado-erro';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { useClubes } from '../../consultas/clubes';
import { usePartida } from '../../consultas/partidas';
import { dataHoraBrasilia } from '../../lib/formatar';
import { CampoPartida } from './campo-partida';
import { ROTULO_ATRIBUTO, ROTULO_RESULTADO } from './rotulos-partida';

function Lado({
  lado,
  alinhamento,
}: {
  lado: LadoComSigla;
  alinhamento: 'esquerda' | 'direita';
}) {
  return (
    <div
      className={`flex flex-col gap-1 ${alinhamento === 'direita' ? 'items-end' : 'items-start'}`}
    >
      <span className="flex items-center gap-2 font-semibold">
        {alinhamento === 'direita' && (
          <span className="text-sm">{lado.club_name}</span>
        )}
        <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-medium">
          {lado.sigla}
        </span>
        {alinhamento === 'esquerda' && (
          <span className="text-sm">{lado.club_name}</span>
        )}
      </span>
      <span className="text-xs text-muted-foreground">
        {alinhamento === 'esquerda' ? 'Mandante' : 'Visitante'} ·{' '}
        {lado.formation}
      </span>
    </div>
  );
}

function ParticipanteCelula({
  p,
  clube,
}: {
  p: ParticipanteDuelo;
  clube: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <AvatarIniciais nome={p.player_name} chave={p.player_id} />
      <div className="flex flex-col">
        <span className="font-medium whitespace-nowrap">{p.player_name}</span>
        <span className="text-xs text-muted-foreground">
          {p.position} · {clube}
        </span>
        {p.condition !== 'APTO' && <CondicaoBadge condicao={p.condition} />}
      </div>
    </div>
  );
}

function GrupoDeDuelos({
  titulo,
  duelos,
  clube,
  adversario,
}: {
  titulo: string;
  duelos: Duelo[];
  clube: LadoComSigla;
  adversario: LadoComSigla;
}) {
  const gols = duelos.filter((d) => d.goal).length;
  return (
    <>
      <tr className="bg-muted-subtle">
        <td colSpan={5} className="px-4 py-2 text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-medium">
              {clube.sigla}
            </span>
            {titulo}
          </span>
        </td>
        <td className="px-4 py-2 text-right text-sm font-medium tabular-nums">
          {gols} {gols === 1 ? 'gol' : 'gols'}
        </td>
      </tr>
      {duelos.map((d) => (
        <tr key={d.order} className="border-t border-border">
          <td className="px-4 py-3 tabular-nums">{d.order}</td>
          <td className="px-4 py-3">
            <ParticipanteCelula p={d.attacker} clube={clube.club_name} />
          </td>
          <td className="px-4 py-3 tabular-nums">
            {ROTULO_ATRIBUTO[d.attacker.attribute] ?? d.attacker.attribute}{' '}
            <span className="font-semibold">{d.attacker.value}</span>
          </td>
          <td className="px-4 py-3">
            <ParticipanteCelula p={d.defender} clube={adversario.club_name} />
          </td>
          <td className="px-4 py-3 tabular-nums">
            Defesa <span className="font-semibold">{d.defender.value}</span>
          </td>
          <td className="px-4 py-3 text-right">
            {d.goal ? (
              <Badge variante="primario">
                <CircleDot className="size-3" aria-hidden="true" />
                Gol
              </Badge>
            ) : (
              <Badge variante="neutro">
                <Minus className="size-3" aria-hidden="true" />
                Sem gol
              </Badge>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

export function PaginaPartida() {
  const { id } = useParams();
  const partidaId = Number(id);
  const consulta = usePartida(partidaId);
  const clubes = useClubes();

  if (consulta.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (consulta.isError) {
    const naoEncontrada =
      consulta.error instanceof ErroApi && consulta.error.status === 404;
    return (
      <div className="flex flex-col gap-4">
        <Link
          to="/partidas"
          className="inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para partidas
        </Link>
        <div className="rounded-xl border border-border bg-card">
          <EstadoErro
            titulo={
              naoEncontrada
                ? 'Partida não encontrada'
                : 'Não foi possível carregar a partida'
            }
            descricao={
              naoEncontrada
                ? 'O endereço pode estar errado ou a partida não existe.'
                : 'Verifique a conexão e tente de novo.'
            }
            aoTentarNovamente={() => void consulta.refetch()}
          />
        </div>
      </div>
    );
  }

  const partida = consulta.data;
  const siglas = new Map(
    (clubes.data ?? []).map((c) => [c.id, c.acronym] as const),
  );
  const comSigla = (lado: LadoPartida) => ({
    ...lado,
    sigla: siglas.get(lado.club_id) ?? '—',
  });
  const duelosMandante = partida.duels.filter(
    (d) => d.attacking_club_id === partida.home.club_id,
  );
  const duelosVisitante = partida.duels.filter(
    (d) => d.attacking_club_id === partida.away.club_id,
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/partidas"
        className="inline-flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para partidas
      </Link>

      <section className="grid items-center gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-[1fr_auto_1fr]">
        <Lado lado={comSigla(partida.home)} alinhamento="esquerda" />
        <div className="flex flex-col items-center gap-2">
          <span className="rounded-md bg-muted px-4 py-2 text-2xl font-semibold tabular-nums">
            {partida.home.goals} × {partida.away.goals}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {dataHoraBrasilia(partida.played_at).replace(' ', ', ')}
          </span>
          <Badge variante="neutro">{ROTULO_RESULTADO[partida.result]}</Badge>
        </div>
        <Lado lado={comSigla(partida.away)} alinhamento="direita" />
      </section>

      <CampoPartida partida={partida} />

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-0.5 p-4 pb-0">
          <h2 className="text-base font-semibold">Duelos</h2>
          <p className="text-sm text-muted-foreground">
            Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de
            linha vão do 1º (o mais recuado) ao 4º (o mais avançado), pela ordem
            do elenco: o 4º ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º.
          </p>
        </div>
        <div className="overflow-x-auto p-4 pt-3">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Duelo</th>
                <th className="px-4 py-2 font-medium">Atacante</th>
                <th className="px-4 py-2 font-medium">Ataque</th>
                <th className="px-4 py-2 font-medium">Defensor</th>
                <th className="px-4 py-2 font-medium">Defesa</th>
                <th className="px-4 py-2 text-right font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody>
              <GrupoDeDuelos
                titulo={`Ataques do ${partida.home.club_name} (mandante)`}
                duelos={duelosMandante}
                clube={comSigla(partida.home)}
                adversario={comSigla(partida.away)}
              />
              <GrupoDeDuelos
                titulo={`Ataques do ${partida.away.club_name} (visitante)`}
                duelos={duelosVisitante}
                clube={comSigla(partida.away)}
                adversario={comSigla(partida.home)}
              />
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Mesma tela logo depois de jogar e ao abrir uma partida do histórico, com
        as formações dos dois clubes e os 6 duelos. Os valores e a condição de
        cada titular vêm gravados nos duelos devolvidos pela API: mal
        condicionado joga com 15% a menos (RN20).
      </p>
    </div>
  );
}
