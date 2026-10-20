import {
  Clock,
  ListOrdered,
  Menu,
  PanelLeft,
  Plus,
  RefreshCw,
  Shield,
  Trophy,
  Users,
  Swords,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
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

  const [menuAberto, setMenuAberto] = useState(false);
  const [menuRecolhido, setMenuRecolhido] = useState(false);
  const secaoAtual = secoesDoCaminho.find((secao) =>
    localizacao.pathname.startsWith(secao.prefixo),
  );
  const idDoClubeNaRota = /^\/clubes\/(\d+)/.exec(localizacao.pathname)?.[1];
  const clubeDaRota = idDoClubeNaRota
    ? clubes.data?.find((clube) => clube.id === Number(idDoClubeNaRota))
    : undefined;
  const ultimaPartida = partidas.data?.[0];
  const secoes = secoesDaSidebar({
    jogadores: totalJogadores.data,
    clubes: clubes.data?.length,
    partidas: partidas.data?.length,
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-overlay md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}
      <aside
        onClick={() => setMenuAberto(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] shrink-0 flex-col gap-5 overflow-hidden border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground md:sticky md:top-0 md:z-auto md:flex md:h-screen',
          menuAberto ? 'flex' : 'hidden',
          menuRecolhido && 'md:hidden',
        )}
      >
        <Link
          to="/inicio"
          aria-label="Passe, ir para a página inicial"
          className="flex items-center gap-3 rounded-md px-2 pt-1 pb-1 transition-colors hover:bg-sidebar-accent"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">
            P
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">Passe</span>
            <span className="text-xs text-muted-foreground">
              Gestão da liga
            </span>
          </div>
        </Link>

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

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground">Clubes</span>
            <Link
              to="/clubes?novo"
              aria-label="Novo clube"
              className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {clubes.data?.length === 0 && (
            <span className="px-2 text-xs text-muted-foreground">
              Nenhum clube ainda.
            </span>
          )}
          {clubes.data?.map((clube) => (
            <NavLink
              key={clube.id}
              to={`/clubes/${clube.id}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'border-sidebar-border bg-background font-medium text-sidebar-accent-foreground shadow-xs'
                    : 'border-transparent hover:bg-sidebar-accent',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded text-[0.625rem] font-medium',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-background',
                    )}
                  >
                    {clube.acronym[0]}
                  </span>
                  {clube.name}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto flex shrink-0 flex-col gap-2.5 rounded-xl border border-border bg-background p-3 text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Trophy
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <div className="flex flex-col">
              <span className="font-medium">Liga Fictícia 2026</span>
              <span className="text-xs text-muted-foreground">
                {clubes.data?.length ?? 0} clubes · {totalJogadores.data ?? 0}{' '}
                jogadores
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Swords
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <div className="flex flex-col">
              <span className="font-medium">Última partida</span>
              <span className="text-xs text-muted-foreground">
                {ultimaPartida
                  ? `${ultimaPartida.home.club_name} ${ultimaPartida.home.goals} × ${ultimaPartida.away.goals} ${ultimaPartida.away.club_name}`
                  : 'nenhuma ainda'}
              </span>
            </div>
          </div>
          <div className="h-px bg-border" aria-hidden="true" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-4" aria-hidden="true" />
            Horário de Brasília (UTC−3)
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 md:px-6">
          <Button
            variante="ghost"
            tamanho="icone"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="md:hidden"
            onClick={() => setMenuAberto(true)}
          >
            <Menu />
          </Button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <Button
                variante="ghost"
                tamanho="icone"
                aria-label={menuRecolhido ? 'Mostrar menu' : 'Recolher menu'}
                aria-expanded={!menuRecolhido}
                onClick={() => setMenuRecolhido((recolhido) => !recolhido)}
              >
                <PanelLeft />
              </Button>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
            </div>
            <nav
              aria-label="Caminho"
              className="flex min-w-0 items-center gap-2 truncate text-sm text-muted-foreground"
            >
              {secaoAtual && (
                <>
                  <span>{secaoAtual.grupo}</span>
                  <span aria-hidden="true">›</span>
                  <span className={clubeDaRota ? '' : 'text-foreground'}>
                    {secaoAtual.titulo}
                  </span>
                  {idDoClubeNaRota && (clubeDaRota || clubes.isSuccess) && (
                    <>
                      <span aria-hidden="true">›</span>
                      <span className="text-foreground">
                        {clubeDaRota?.name ?? `Clube ${idDoClubeNaRota}`}
                      </span>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
          <Button
            variante="ghost"
            tamanho="icone"
            aria-label="Atualizar dados"
            onClick={() => void consultas.invalidateQueries()}
          >
            <RefreshCw />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
