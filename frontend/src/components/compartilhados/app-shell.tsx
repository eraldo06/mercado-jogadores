import {
  ListOrdered,
  RefreshCw,
  Shield,
  Trophy,
  Users,
  Swords,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useClubes } from '../../consultas/clubes';
import { useContagemJogadores } from '../../consultas/jogadores';
import { usePartidas } from '../../consultas/partidas';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Toaster } from '../ui/sonner';

type ItemMenu = {
  caminho: string;
  rotulo: string;
  icone: ComponentType<{ className?: string }>;
  contagem?: number;
};

type SecaoMenu = {
  titulo: string;
  itens: ItemMenu[];
};

const secoesDaSidebar = (contagens: {
  jogadores?: number;
  clubes?: number;
  partidas?: number;
}) =>
  [
    {
      titulo: 'Mercado',
      itens: [
        {
          caminho: '/jogadores',
          rotulo: 'Jogadores',
          icone: Users,
          contagem: contagens.jogadores,
        },
        {
          caminho: '/clubes',
          rotulo: 'Clubes',
          icone: Shield,
          contagem: contagens.clubes,
        },
      ],
    },
    {
      titulo: 'Liga',
      itens: [
        {
          caminho: '/partidas',
          rotulo: 'Partidas',
          icone: Swords,
          contagem: contagens.partidas,
        },
        {
          caminho: '/classificacao',
          rotulo: 'Classificação',
          icone: ListOrdered,
        },
      ],
    },
  ] satisfies SecaoMenu[];

const secoesDoCaminho = [
  { prefixo: '/jogadores', grupo: 'Mercado', titulo: 'Jogadores' },
  { prefixo: '/clubes', grupo: 'Mercado', titulo: 'Clubes' },
  { prefixo: '/partidas', grupo: 'Liga', titulo: 'Partidas' },
  { prefixo: '/classificacao', grupo: 'Liga', titulo: 'Classificação' },
];

export function AppShell() {
  const localizacao = useLocation();
  const consultas = useQueryClient();
  const totalJogadores = useContagemJogadores({});
  const clubes = useClubes();
  const partidas = usePartidas();

  const secaoAtual = secoesDoCaminho.find((secao) =>
    localizacao.pathname.startsWith(secao.prefixo),
  );
  const ultimaPartida = partidas.data?.[0];
  const secoes = secoesDaSidebar({
    jogadores: totalJogadores.data,
    clubes: clubes.data?.length,
    partidas: partidas.data?.length,
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-5 border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
        <div className="flex items-center gap-3 px-2 pt-1">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">
            P
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">Passe</span>
            <span className="text-xs text-muted-foreground">
              Gestão da liga
            </span>
          </div>
        </div>

        <nav aria-label="Menu principal" className="flex flex-col gap-4">
          {secoes.map((secao) => (
            <div key={secao.titulo} className="flex flex-col gap-1">
              <span className="px-2 text-xs text-muted-foreground">
                {secao.titulo}
              </span>
              {secao.itens.map((item) => (
                <NavLink
                  key={item.caminho}
                  to={item.caminho}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'border-sidebar-border bg-background font-medium text-sidebar-accent-foreground shadow-xs'
                        : 'border-transparent hover:bg-sidebar-accent',
                    )
                  }
                >
                  <span className="flex items-center gap-2">
                    <item.icone
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {item.rotulo}
                  </span>
                  {item.contagem !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {item.contagem}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-1">
          <span className="px-2 text-xs text-muted-foreground">Clubes</span>
          {clubes.data?.length === 0 && (
            <span className="px-2 text-xs text-muted-foreground">
              Nenhum clube ainda.
            </span>
          )}
          {clubes.data?.map((clube) => (
            <NavLink
              key={clube.id}
              to={`/clubes/${clube.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent"
            >
              <span className="flex size-5 items-center justify-center rounded border border-border bg-background text-[0.625rem] font-medium">
                {clube.acronym[0]}
              </span>
              {clube.name}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-sm">
          <div className="flex items-center gap-2">
            <Trophy
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="flex flex-col">
              <span className="font-medium">Liga Fictícia 2026</span>
              <span className="text-xs text-muted-foreground">
                {clubes.data?.length ?? 0} clubes · {totalJogadores.data ?? 0}{' '}
                jogadores
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Última partida</span>
            <span className="text-xs text-muted-foreground">
              {ultimaPartida
                ? `${ultimaPartida.home.club_name} ${ultimaPartida.home.goals} × ${ultimaPartida.away.goals} ${ultimaPartida.away.club_name}`
                : 'nenhuma ainda'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Horário de Brasília (UTC−3)
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-3">
          <nav
            aria-label="Caminho"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            {secaoAtual && (
              <>
                <span>{secaoAtual.grupo}</span>
                <span aria-hidden="true">›</span>
                <span className="text-foreground">{secaoAtual.titulo}</span>
              </>
            )}
          </nav>
          <Button
            variante="ghost"
            tamanho="icone"
            aria-label="Atualizar dados"
            onClick={() => void consultas.invalidateQueries()}
          >
            <RefreshCw />
          </Button>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
