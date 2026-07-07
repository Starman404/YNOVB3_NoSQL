import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getArtists } from '../services/api';
import GlowCard from '../components/GlowCard';

export default function Artists() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    getArtists().then((data) => { setArtists(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    artists.forEach((a) => a.genres?.forEach((g: string) => set.add(g)));
    return [...set].sort();
  }, [artists]);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    artists.forEach((a) => { if (a.country || a.area) set.add(a.country || a.area); });
    return [...set].sort();
  }, [artists]);

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      if (searchName && !a.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (selectedGenre && !a.genres?.includes(selectedGenre)) return false;
      if (selectedCountry && a.country !== selectedCountry && a.area !== selectedCountry) return false;
      return true;
    });
  }, [artists, searchName, selectedGenre, selectedCountry]);

  const hasFilters = searchName || selectedGenre || selectedCountry;

  return (
    <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Artistes importés
      </motion.h1>

      {!loading && artists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            className="input"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Rechercher par nom..."
            style={{ flex: 1, minWidth: 200, maxWidth: 350 }}
          />

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{
              padding: '0.85rem 1.2rem',
              background: 'var(--bg-secondary)',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              borderRadius: 14,
              color: selectedGenre ? 'var(--accent-purple)' : 'var(--text-muted)',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              outline: 'none',
              minWidth: 180,
            }}
          >
            <option value="">Tous les genres</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{
              padding: '0.85rem 1.2rem',
              background: 'var(--bg-secondary)',
              border: '2px solid rgba(6, 182, 212, 0.2)',
              borderRadius: 14,
              color: selectedCountry ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              outline: 'none',
              minWidth: 150,
            }}
          >
            <option value="">Tous les pays</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {hasFilters && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setSearchName(''); setSelectedGenre(''); setSelectedCountry(''); }}
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: 12,
                border: '1px solid rgba(236, 72, 153, 0.3)',
                background: 'rgba(236, 72, 153, 0.1)',
                color: 'var(--accent-pink)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Effacer les filtres
            </motion.button>
          )}

          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {filtered.length} / {artists.length} artiste{artists.length > 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          {[...Array(5)].map((_, i) => <span key={i} className="equalizer-bar" />)}
        </div>
      ) : artists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}
        >
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Aucun artiste importé</p>
          <Link to="/search">
            <button className="btn btn-primary">Rechercher et importer</button>
          </Link>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}
        >
          <p style={{ fontSize: '1.1rem' }}>Aucun artiste ne correspond aux filtres</p>
        </motion.div>
      ) : (
        <div className="grid grid-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((artist, i) => (
              <motion.div
                key={artist.mbid}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.03, type: 'spring' }}
              >
                <Link to={`/artists/${artist.mbid}`}>
                  <GlowCard>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `hsl(${(artist.name.charCodeAt(0) * 37) % 360}, 70%, 50%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      marginBottom: '1rem',
                      fontFamily: 'Space Grotesk',
                    }}>
                      {artist.name.charAt(0)}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, fontFamily: 'Space Grotesk' }}>
                      {artist.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {artist.type && <span className="badge badge-purple">{artist.type}</span>}
                      {(artist.country || artist.area) && <span className="badge badge-cyan">{artist.country || artist.area}</span>}
                    </div>
                    {artist.genres?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {artist.genres.slice(0, 3).map((g: string) => (
                          <span key={g} className="badge badge-pink" style={{ fontSize: '0.65rem' }}>{g}</span>
                        ))}
                        {artist.genres.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{artist.genres.length - 3}</span>
                        )}
                      </div>
                    )}
                    {artist.beginDate && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
                        Depuis {artist.beginDate}
                      </p>
                    )}
                  </GlowCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
