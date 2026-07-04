import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import ArtistsList from "./pages/ArtistsList.jsx";
import ArtistDetail from "./pages/ArtistDetail.jsx";
import Tracks from "./pages/Tracks.jsx";
import Graph from "./pages/Graph.jsx";
import Stats from "./pages/Stats.jsx";

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/search">Recherche</Link>
        <Link to="/artists">Artistes</Link>
        <Link to="/tracks">Morceaux</Link>
        <Link to="/graph">Graphe</Link>
        <Link to="/stats">Statistiques</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/artists" element={<ArtistsList />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/tracks" element={<Tracks />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </>
  );
}
