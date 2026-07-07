import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getArtist, getArtistRecordings, getArtistReleases, getArtistCollaborations } from '../services/api';
import GlowCard from '../components/GlowCard';

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [collabs, setCollabs] = useState<any[]>([]);
  const [tab, setTab] = useState<'tracks' | 'albums' | 'collabs'>('tracks');

  useEffect(() => {
    if (!id) return;
    getArtist(id).then(setArtist);
    getArtistRecordings(id).then(setRecordings);
    getArtistReleases(id).then(setReleases);
    getArtistCollaborations(id).then(setCollabs);
  }, [id]);

  if (!artist) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      {[...Array(5)].map((_, i) => <span key={i} className="equalizer-bar" />)}
    </div>
  );

  const formatDuration = (ms: number) => {
    if (!ms) return '';
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          marginBottom: '3rem',
          flexWrap: 'wrap',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `hsl(${(artist.name.charCodeAt(0) * 37) % 360}, 70%, 50%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 900,
            fontFamily: 'Space Grotesk',
            boxShadow: `0 0 40px hsl(${(artist.name.charCodeAt(0) * 37) % 360}, 70%, 50%, 0.3)`,
          }}
        >
          {artist.name.charAt(0)}
        </motion.div>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>{artist.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {artist.type && <span className="badge badge-purple">{artist.type}</span>}
            {artist.country && <span className="badge badge-cyan">{artist.country}</span>}
            {artist.genres?.map((g: string) => (
              <span key={g} className="badge badge-pink">{g}</span>
            ))}
          </div>
          {artist.disambiguation && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{artist.disambiguation}</p>
          )}
          {artist.beginDate && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              {artist.beginDate}{artist.endDate ? ` — ${artist.endDate}` : ' — présent'}
            </p>
          )}
          <Link to={`/graph?artist=${id}`} style={{ marginTop: 12, display: 'inline-block' }}>
            <button className="btn btn-secondary" style={{ marginTop: 8 }}>
              Voir dans le graphe
            </button>
          </Link>
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: 4, marginBottom: '2rem' }}>
        {[
          { key: 'tracks' as const, label: `Morceaux (${recordings.length})` },
          { key: 'albums' as const, label: `Albums (${releases.length})` },
          { key: 'collabs' as const, label: `Collaborations (${collabs.length})` },
        ].map((t) => (
          <motion.button
            key={t.key}
            onClick={() => setTab(t.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 10,
              border: 'none',
              background: tab === t.key ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: tab === t.key ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      {tab === 'tracks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recordings.map((rec, i) => (
            <motion.div
              key={rec.mbid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.8rem 1.2rem',
                background: 'var(--bg-card)',
                borderRadius: 12,
                border: '1px solid rgba(139, 92, 246, 0.1)',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: 30 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{rec.title}</div>
                {rec.firstReleaseDate && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.firstReleaseDate}</span>
                )}
              </div>
              {rec.hasFeaturing && <span className="badge badge-pink">feat.</span>}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {formatDuration(rec.length)}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'albums' && (
        <div className="grid grid-3">
          {releases.map((rel, i) => (
            <motion.div
              key={rel.mbid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlowCard color="#06b6d4">
                <h4 style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'Space Grotesk' }}>{rel.title}</h4>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {rel.date && <span className="badge badge-cyan">{rel.date}</span>}
                  {rel.releaseType && <span className="badge badge-purple">{rel.releaseType}</span>}
                  {rel.status && <span className="badge badge-pink">{rel.status}</span>}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'collabs' && (
        <div className="grid grid-2">
          {collabs.map((c, i) => (
            <motion.div
              key={c.artist.mbid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/artists/${c.artist.mbid}`}>
                <GlowCard color="#ec4899">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 45,
                      height: 45,
                      borderRadius: '50%',
                      background: `hsl(${(c.artist.name.charCodeAt(0) * 37) % 360}, 70%, 50%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontFamily: 'Space Grotesk',
                    }}>
                      {c.artist.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontFamily: 'Space Grotesk' }}>{c.artist.name}</h4>
                      {c.sharedTracks?.length > 0 && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {c.sharedTracks.length} titre{c.sharedTracks.length > 1 ? 's' : ''} en commun
                        </p>
                      )}
                    </div>
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
