import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStatsOverview } from '../services/api';

export default function Home() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getStatsOverview().then(setStats).catch(() => {});
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'var(--gradient-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 50,
            marginBottom: '2rem',
            boxShadow: 'var(--glow-purple)',
          }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ♫
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 900,
            background: 'var(--gradient-main)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
            marginBottom: '1rem',
          }}
        >
          MusicGraph
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            maxWidth: 600,
            marginBottom: '3rem',
            lineHeight: 1.6,
          }}
        >
          Explorez les collaborations musicales. Découvrez les liens cachés
          entre vos artistes préférés grâce à la puissance des graphes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link to="/search">
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
            >
              Rechercher un artiste
            </motion.button>
          </Link>
          <Link to="/graph">
            <motion.button
              className="btn btn-secondary"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
            >
              Explorer le graphe
            </motion.button>
          </Link>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '4rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { label: 'Artistes', value: stats.artists, color: '#8b5cf6' },
              { label: 'Morceaux', value: stats.recordings, color: '#ec4899' },
              { label: 'Albums', value: stats.releases, color: '#06b6d4' },
              { label: 'Collabs', value: stats.collaborations, color: '#10b981' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4 + i * 0.1, type: 'spring' }}
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 2rem',
                  background: 'var(--bg-card)',
                  borderRadius: 16,
                  border: `1px solid ${s.color}33`,
                  minWidth: 120,
                }}
              >
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: s.color, fontFamily: 'Space Grotesk' }}>
                  {s.value}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '2rem 0' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className="equalizer-bar" />
        ))}
      </div>
    </div>
  );
}
