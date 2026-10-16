import { NavLink, Navigate, Route, Routes } from 'react-router';

function EmConstrucao({ titulo }: { titulo: string }) {
  return <h1>{titulo}</h1>;
}

export default function App() {
  return (
    <>
      <header className="cabecalho">
        <strong>Passe</strong>
        <nav>
          <NavLink to="/jogadores">Jogadores</NavLink>
          <NavLink to="/clubes">Clubes</NavLink>
          <NavLink to="/partidas">Partidas</NavLink>
          <NavLink to="/classificacao">Classificação</NavLink>
        </nav>
      </header>
      <main className="conteudo">
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
