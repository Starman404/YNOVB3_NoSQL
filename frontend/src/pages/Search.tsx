import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchArtists, importArtist } from '../services/api';
import GlowCard from '../components/GlowCard';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchArtists(query);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleImport = async (mbid: string) => {
    setImporting(mbid);
    try {
      await importArtist(mbid);
      setImported((prev) => new Set(prev).add(mbid));
    } catch (err) {
      console.error(err);
    }
    setImporting(null);
  };

  return (
    <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Rechercher un artiste
      </motion.h1>

      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: 700 }}
      >
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Daft Punk, Kendrick Lamar, PNL, Stromae..."
          style={{ flex: 1 }}
        />
        <motion.button
          type="submit"
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: 'flex', gap: 3 }}>
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'block' }}
                />
              ))}
            </span>
          ) : 'Rechercher'}
        </motion.button>
      </motion.form>

      <AnimatePresence>
        <div className="grid grid-2">
          {results.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlowCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Space Grotesk' }}>
                      {artist.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {artist.type && <span className="badge badge-purple">{artist.type}</span>}
                      {artist.country && <span className="badge badge-cyan">{artist.country}</span>}
                      {artist.score && <span className="badge badge-pink">{artist.score}%</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: 4 }}>
                      MBID : {artist.id}
                    </p>
                    {artist.disambiguation && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {artist.disambiguation}
                      </p>
                    )}
                    {artist['life-span']?.begin && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Actif depuis {artist['life-span'].begin}
                        {artist['life-span']?.ended ? ` — ${artist['life-span'].end}` : ''}
                      </p>
                    )}
                  </div>
                  <motion.button
                    className="btn btn-primary"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleImport(artist.id)}
                    disabled={importing === artist.id || imported.has(artist.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      opacity: imported.has(artist.id) ? 0.6 : 1,
                    }}
                  >
                    {imported.has(artist.id) ? 'Importé ✓' :
                     importing === artist.id ? '...' : 'Importer'}
                  </motion.button>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
