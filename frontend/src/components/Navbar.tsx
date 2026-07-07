import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/search', label: 'Recherche' },
  { to: '/artists', label: 'Artistes' },
  { to: '/recordings', label: 'Morceaux' },
  { to: '/graph', label: 'Graphe' },
  { to: '/stats', label: 'Stats' },
];

export default function Navbar() {
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
        padding: '0 2rem',
      }}
    >
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--gradient-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            ♪
          </motion.div>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'var(--gradient-main)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            MusicGraph
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 4 }}>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}>
                <motion.div
                  onHoverStart={() => setHovered(link.to)}
                  onHoverEnd={() => setHovered(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                  {(isActive || hovered === link.to) && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        left: '20%',
                        right: '20%',
                        height: 2,
                        background: 'var(--gradient-main)',
                        borderRadius: 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
