import { motion } from 'framer-motion';
import { type ReactNode, useRef, useState } from 'react';

interface Props {
  children: ReactNode;
  color?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function GlowCard({ children, color = '#8b5cf6', onClick, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        borderRadius: 16,
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: mousePos.y - 100,
          left: mousePos.x - 100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'top 0.1s, left 0.1s',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}
