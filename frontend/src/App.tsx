import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/compartilhados/app-shell';
import { PaginaJogadores } from './paginas/jogadores/pagina-jogadores';
import { PaginaClube } from './paginas/clubes/pagina-clube';
import { PaginaClubes } from './paginas/clubes/pagina-clubes';
import { PaginaPartida } from './paginas/liga/pagina-partida';
import { PaginaPartidas } from './paginas/liga/pagina-partidas';

function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-[-0.025em]">{titulo}</h1>
      <p className="text-sm text-muted-foreground">
        Esta tela ainda será implementada.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/jogadores" replace />} />
        <Route path="jogadores" element={<PaginaJogadores />} />
        <Route path="clubes" element={<PaginaClubes />} />
        <Route path="clubes/:id" element={<PaginaClube />} />
        <Route path="partidas" element={<PaginaPartidas />} />
        <Route path="partidas/:id" element={<PaginaPartida />} />
        <Route
          path="classificacao"
          element={<EmConstrucao titulo="Classificação" />}
        />
      </Route>
    </Routes>
  );
}
