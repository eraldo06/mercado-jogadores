import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/compartilhados/app-shell';
import { PaginaJogadores } from './paginas/jogadores/pagina-jogadores';
import { PaginaClube } from './paginas/clubes/pagina-clube';
import { PaginaClubes } from './paginas/clubes/pagina-clubes';
import { PaginaPartida } from './paginas/liga/pagina-partida';
import { PaginaPartidas } from './paginas/liga/pagina-partidas';
import { PaginaClassificacao } from './paginas/liga/pagina-classificacao';

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
        <Route path="classificacao" element={<PaginaClassificacao />} />
      </Route>
    </Routes>
  );
}
