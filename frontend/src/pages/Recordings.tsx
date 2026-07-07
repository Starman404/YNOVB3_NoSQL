import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getRecordings } from '../services/api';

export default function Recordings() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecordings().then((data) => { setRecordings(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const formatDuration = (ms: number) => {
    if (!ms) return '—';
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Morceaux
      </motion.h1>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          {[...Array(5)].map((_, i) => <span key={i} className="equalizer-bar" />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 120px 80px',
            gap: '1rem',
            padding: '0.5rem 1.2rem',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}>
            <span>#</span>
            <span>Titre</span>
            <span>Date</span>
            <span style={{ textAlign: 'right' }}>Durée</span>
          </div>
          {recordings.map((rec, i) => (
            <motion.div
              key={rec.mbid}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.015 }}
              whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', x: 4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 120px 80px',
                gap: '1rem',
                padding: '0.7rem 1.2rem',
                borderRadius: 10,
                alignItems: 'center',
                cursor: 'default',
                transition: 'background 0.2s',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{i + 1}</span>
              <div>
                <span style={{ fontWeight: 500 }}>{rec.title}</span>
                {rec.hasFeaturing && <span className="badge badge-pink" style={{ marginLeft: 8 }}>feat.</span>}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {rec.firstReleaseDate || '—'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {formatDuration(rec.length)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
