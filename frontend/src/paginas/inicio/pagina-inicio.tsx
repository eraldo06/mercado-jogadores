import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  Clock,
  Handshake,
  History,
  ShoppingCart,
  Shield,
  Swords,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { useClubes } from '../../consultas/clubes';
import { useContagemJogadores } from '../../consultas/jogadores';
import { useClassificacao, usePartidas } from '../../consultas/partidas';

type Etapa = {
  numero: string;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
};

const ETAPAS: Etapa[] = [
  {
    numero: '01',
    titulo: 'Jogadores',
    descricao:
      'Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.',
    icone: Users,
  },
  {
    numero: '02',
    titulo: 'Clubes',
    descricao: 'Começam com 300,00 em caixa e sem jogadores.',
    icone: Shield,
  },
  {
    numero: '03',
    titulo: 'Compra',
    descricao: 'Valor + taxa, até 50% do caixa, com contrato de fidelidade.',
    icone: ShoppingCart,
  },
  {
    numero: '04',
    titulo: 'Venda',
    descricao: 'Multa antes do fim da fidelidade e comissão sobre o lucro.',
    icone: Handshake,
  },
  {
    numero: '05',
    titulo: 'Histórico',
    descricao: 'Toda compra e venda fica registrada, com totais e CSV.',
    icone: History,
  },
  {
    numero: '06',
    titulo: 'Liga',
    descricao:
      'Escale 5 titulares e jogue partidas que entram na classificação.',
    icone: Trophy,
  },
];

function Estatistica({
  icone: Icone,
  valor,
  rotulo,
}: {
  icone: LucideIcon;
  valor: number | string;
  rotulo: string;
}) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icone className="size-4" aria-hidden="true" />
      <span className="font-medium text-foreground tabular-nums">{valor}</span>
      {rotulo}
    </span>
  );
}

export function PaginaInicio() {
  const navegar = useNavigate();
  const totalJogadores = useContagemJogadores({});
  const livres = useContagemJogadores({ free: true });
  const clubes = useClubes();
  const partidas = usePartidas();
  const classificacao = useClassificacao();

  useEffect(() => {
    const aoPressionarEnter = (evento: KeyboardEvent) => {
      if (evento.key !== 'Enter' || evento.defaultPrevented) return;
      const alvo = evento.target;
      if (alvo instanceof HTMLElement && alvo !== document.body) return;
      navegar('/jogadores');
    };
    window.addEventListener('keydown', aoPressionarEnter);
    return () => window.removeEventListener('keydown', aoPressionarEnter);
  }, [navegar]);

  const quantidadePartidas = partidas.data?.length ?? 0;
  const lider = classificacao.data?.[0];
  const textoSelo =
    quantidadePartidas === 0 || !lider
      ? 'nenhuma partida ainda'
      : `líder: ${lider.club_name}, ${lider.points} ${lider.points === 1 ? 'ponto' : 'pontos'}`;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div
        className="pointer-events-none absolute inset-x-[6.8%] inset-y-[5.4%] rounded-3xl border-[1.5px] border-border"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-[5.4%] left-1/2 w-px bg-border"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-border lg:block"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-[22px]">
          <div className="flex items-center gap-5">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
              P
            </span>
            <span className="text-[32px] leading-10 font-semibold tracking-[-0.03em] text-foreground">
              Passe
            </span>
          </div>
          <span className="flex h-7 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-3 text-xs">
            <span
              className="size-2 rounded-full bg-success"
              aria-hidden="true"
            />
            <span className="font-medium">Liga Fictícia 2026</span>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <span className="text-muted-foreground">{textoSelo}</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-[40px] leading-[48px] font-semibold tracking-[-0.025em] text-foreground">
            Gestão da liga, do mercado à classificação
          </h1>
          <p className="max-w-[624px] text-base leading-6 text-muted-foreground">
            Cadastre jogadores, monte os clubes e negocie com contrato de
            fidelidade. Depois, escale os titulares e jogue partidas com placar
            calculado pelos atributos.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-[14px]">
            <Button asChild tamanho="lg" className="w-[200px] text-sm">
              <Link to="/jogadores">
                Iniciar
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              ou tecle
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                Enter
              </kbd>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Estatistica
              icone={Users}
              valor={totalJogadores.data ?? 0}
              rotulo="jogadores"
            />
            <span className="text-muted-foreground" aria-hidden="true">
              •
            </span>
            <Estatistica
              icone={User}
              valor={livres.data ?? 0}
              rotulo="livres"
            />
            <span className="text-muted-foreground" aria-hidden="true">
              •
            </span>
            <Estatistica
              icone={Shield}
              valor={clubes.data?.length ?? 0}
              rotulo="clubes"
            />
            <span className="text-muted-foreground" aria-hidden="true">
              •
            </span>
            <Estatistica
              icone={Swords}
              valor={quantidadePartidas}
              rotulo="partidas"
            />
            <span className="text-muted-foreground" aria-hidden="true">
              •
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleCheck className="size-4" aria-hidden="true" />
              Não precisa de login
            </span>
          </div>
        </div>

        <ol className="flex w-full flex-wrap items-stretch justify-center gap-3 lg:gap-0">
          {ETAPAS.map((etapa, indice) => (
            <li
              key={etapa.numero}
              className="flex w-full items-stretch sm:w-[calc(50%-0.375rem)] lg:w-auto"
            >
              <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-background p-4 lg:w-[171px]">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <etapa.icone className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {etapa.numero}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{etapa.titulo}</span>
                  <span className="text-xs leading-4 text-muted-foreground">
                    {etapa.descricao}
                  </span>
                </div>
              </div>
              {indice < ETAPAS.length - 1 && (
                <span
                  className="hidden w-[33px] shrink-0 items-center justify-center text-muted-foreground lg:flex"
                  aria-hidden="true"
                >
                  <ChevronRight className="size-3" />
                </span>
              )}
            </li>
          ))}
        </ol>

        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-4" aria-hidden="true" />
          Liga Fictícia 2026 · Horário de Brasília (UTC−3)
        </span>
      </div>
    </div>
  );
}
