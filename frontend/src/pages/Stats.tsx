import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getStatsOverview, getTopArtists, getTopCollaborations, getTopGenres } from '../services/api';
import GlowCard from '../components/GlowCard';

export default function Stats() {
  const [overview, setOverview] = useState<any>(null);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [topCollabs, setTopCollabs] = useState<any[]>([]);
  const [topGenres, setTopGenres] = useState<any[]>([]);

  useEffect(() => {
    getStatsOverview().then(setOverview).catch(() => {});
    getTopArtists().then(setTopArtists).catch(() => {});
    getTopCollaborations().then(setTopCollabs).catch(() => {});
    getTopGenres().then(setTopGenres).catch(() => {});
  }, []);

  return (
    <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Statistiques
      </motion.h1>

      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { label: 'Artistes', value: overview.artists, color: '#8b5cf6', icon: '🎤' },
            { label: 'Morceaux', value: overview.recordings, color: '#ec4899', icon: '🎵' },
            { label: 'Albums', value: overview.releases, color: '#06b6d4', icon: '💿' },
            { label: 'Collaborations', value: overview.collaborations, color: '#10b981', icon: '🤝' },
            { label: 'Genres', value: overview.genres, color: '#f59e0b', icon: '🎸' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlowCard color={s.color}>
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    style={{ fontSize: '2rem', marginBottom: 8 }}
                  >
                    {s.icon}
                  </motion.div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, fontFamily: 'Space Grotesk' }}>
                    {s.value}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-purple)' }}>
            Top Artistes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topArtists.map((a, i) => (
              <Link key={a.mbid} to={`/artists/${a.mbid}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ x: 8, backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.7rem 1rem',
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: i < 3 ? 'var(--gradient-main)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{a.name}</span>
                  <span className="badge badge-purple">{a.trackCount} titres</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-pink)' }}>
            Top Collaborations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topCollabs.map((c, i) => (
              <motion.div
                key={`${c.mbid1}-${c.mbid2}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                whileHover={{ x: 8, backgroundColor: 'rgba(236, 72, 153, 0.08)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 10,
                }}
              >
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: i < 3 ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontWeight: 500 }}>
                  <span style={{ fontWeight: 700 }}>{c.artist1}</span>
                  <span style={{ color: 'var(--accent-pink)', margin: '0 6px' }}>×</span>
                  <span style={{ fontWeight: 700 }}>{c.artist2}</span>
                </span>
                <span className="badge badge-pink">{c.sharedTracks} titres</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-green)' }}>
            Top Genres
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topGenres.map((g, i) => (
              <motion.div
                key={g.genre}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.05, type: 'spring' }}
                whileHover={{ scale: 1.1 }}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--accent-green)',
                  fontWeight: 600,
                  fontSize: `${Math.max(0.8, 1.2 - i * 0.03)}rem`,
                  cursor: 'default',
                }}
              >
                {g.genre} ({g.artistCount})
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
