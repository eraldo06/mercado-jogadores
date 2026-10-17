import { NavLink, Navigate, Route, Routes } from 'react-router';

function EmConstrucao({ titulo }: { titulo: string }) {
  return <h1>{titulo}</h1>;
}

export default function App() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
        <strong>Passe</strong>
        <nav className="flex flex-wrap gap-3">
          <NavLink to="/jogadores">Jogadores</NavLink>
          <NavLink to="/clubes">Clubes</NavLink>
          <NavLink to="/partidas">Partidas</NavLink>
          <NavLink to="/classificacao">Classificação</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/jogadores" replace />} />
          <Route
            path="/jogadores"
            element={<EmConstrucao titulo="Jogadores" />}
          />
          <Route path="/clubes" element={<EmConstrucao titulo="Clubes" />} />
          <Route path="/clubes/:id" element={<EmConstrucao titulo="Clube" />} />
          <Route
            path="/partidas"
            element={<EmConstrucao titulo="Partidas" />}
          />
          <Route
            path="/classificacao"
            element={<EmConstrucao titulo="Classificação" />}
          />
        </Routes>
      </main>
    </>
  );
}
