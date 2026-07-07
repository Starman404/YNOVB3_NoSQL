import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ForceGraph2D from 'react-force-graph-2d';
import { getCollaborationsGraph, getArtistGraph, getGraphData, getShortestPath, getArtists } from '../services/api';

const NODE_COLORS: Record<string, string> = {
  Artist: '#8b5cf6',
  Recording: '#ec4899',
  Release: '#06b6d4',
  Genre: '#10b981',
  Label: '#f59e0b',
  Area: '#6366f1',
};

export default function Graph() {
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get('artist');
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'full' | 'collabs' | 'artist' | 'path'>(artistId ? 'artist' : 'collabs');
  const graphRef = useRef<any>(null);

  // Pour le mode "Chemin entre deux artistes"
  const [artistsList, setArtistsList] = useState<any[]>([]);
  const [fromArtist, setFromArtist] = useState('');
  const [toArtist, setToArtist] = useState('');
  const [pathInfo, setPathInfo] = useState<{ found: boolean; length: number } | null>(null);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (mode === 'artist' && artistId) {
        data = await getArtistGraph(artistId);
      } else if (mode === 'collabs') {
        data = await getCollaborationsGraph();
      } else if (mode === 'path') {
        // Le graphe du chemin n'est chargé qu'au clic sur "Trouver le chemin"
        data = graphData;
      } else {
        data = await getGraphData();
      }
      setGraphData(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [mode, artistId]);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  useEffect(() => {
    if (mode === 'path' && artistsList.length === 0) {
      getArtists().then(setArtistsList).catch(console.error);
    }
  }, [mode, artistsList.length]);

  const findPath = useCallback(async () => {
    if (!fromArtist || !toArtist) return;
    setLoading(true);
    setPathInfo(null);
    try {
      const data = await getShortestPath(fromArtist, toArtist);
      setGraphData({ nodes: data.nodes, links: data.links });
      setPathInfo({ found: data.found, length: data.length });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [fromArtist, toArtist]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const size = node.type === 'Artist' ? 8 : 5;
    const color = NODE_COLORS[node.type] || '#8b5cf6';

    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
    ctx.fillStyle = color + '33';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `${node.type === 'Artist' ? 4 : 3}px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText(node.label || '', node.x, node.y + size + 6);
  }, []);

  return (
    <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <motion.h1
          className="page-title"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: 0 }}
        >
          Graphe musical
        </motion.h1>

        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { key: 'collabs' as const, label: 'Collaborations' },
            { key: 'full' as const, label: 'Graphe complet' },
            { key: 'path' as const, label: 'Chemin entre 2 artistes' },
          ].map((m) => (
            <motion.button
              key={m.key}
              onClick={() => setMode(m.key)}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 10,
                border: 'none',
                background: mode === m.key ? 'var(--accent-purple)' : 'var(--bg-card)',
                color: mode === m.key ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {m.label}
            </motion.button>
          ))}
        </div>
      </div>

      {mode === 'path' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={fromArtist}
            onChange={(e) => setFromArtist(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
          >
            <option value="">Artiste de départ…</option>
            {artistsList.map((a: any) => (
              <option key={a.mbid} value={a.mbid}>{a.name}</option>
            ))}
          </select>
          <span style={{ color: 'var(--text-secondary)' }}>→</span>
          <select
            value={toArtist}
            onChange={(e) => setToArtist(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
          >
            <option value="">Artiste d'arrivée…</option>
            {artistsList.map((a: any) => (
              <option key={a.mbid} value={a.mbid}>{a.name}</option>
            ))}
          </select>
          <motion.button
            onClick={findPath}
            whileHover={{ scale: 1.05 }}
            disabled={!fromArtist || !toArtist}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 10,
              border: 'none',
              background: 'var(--accent-purple)',
              color: 'white',
              fontWeight: 600,
              cursor: fromArtist && toArtist ? 'pointer' : 'not-allowed',
              opacity: fromArtist && toArtist ? 1 : 0.5,
            }}
          >
            Trouver le chemin
          </motion.button>
          {pathInfo && (
            <span style={{ color: pathInfo.found ? 'var(--text-primary)' : '#f87171', fontSize: '0.9rem' }}>
              {pathInfo.found
                ? `Chemin trouvé : ${pathInfo.length} relation${pathInfo.length > 1 ? 's' : ''}`
                : 'Aucun chemin trouvé entre ces deux artistes (dans la limite de 6 sauts)'}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {type}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          border: '1px solid rgba(139, 92, 246, 0.15)',
          overflow: 'hidden',
          height: '70vh',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            {[...Array(5)].map((_, i) => <span key={i} className="equalizer-bar" />)}
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeCanvasObject={paintNode}
            linkColor={() => 'rgba(139, 92, 246, 0.2)'}
            linkWidth={1}
            backgroundColor="transparent"
            onNodeClick={(node: any) => {
              if (node.type === 'Artist' && node.id) {
                window.location.href = `/artists/${node.id}`;
              }
            }}
            cooldownTicks={100}
            nodeRelSize={6}
          />
        )}
      </motion.div>
    </div>
  );
}
