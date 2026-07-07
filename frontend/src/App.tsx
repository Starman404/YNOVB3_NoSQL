import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ParticlesBackground from './components/ParticlesBackground';
import Home from './pages/Home';
import Search from './pages/Search';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Recordings from './pages/Recordings';
import Graph from './pages/Graph';
import Stats from './pages/Stats';

function App() {
  return (
    <BrowserRouter>
      <ParticlesBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/recordings" element={<Recordings />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
