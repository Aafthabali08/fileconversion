import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface GameLoaderProps {
  progress: number;
  label?: string;
  sublabel?: string;
}

export const GameLoader: React.FC<GameLoaderProps> = ({
  progress,
  label = 'Processing...',
  sublabel,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Generate particle positions deterministically
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.sin(i * 1.3) * 120 + 150,
      y: Math.cos(i * 1.7) * 120 + 150,
      size: 2 + (i % 4) * 1.5,
      delay: (i * 0.15) % 3,
      duration: 2 + (i % 3),
    }));
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '48px 32px',
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
  };

  const orbitalContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '180px',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const percentageStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#f0f0f5',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    zIndex: 2,
  };

  const percentSignStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#f0f0f5',
    textAlign: 'center',
  };

  const sublabelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: '-16px',
  };

  const progressBarTrackStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    height: '6px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative',
  };

  // SVG orbital ring
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background glow pulse */}
      <motion.div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: '#2563eb',
          opacity: 0.06,
          filter: 'blur(60px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      <svg
        width="300"
        height="300"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', pointerEvents: 'none', opacity: 0.5 }}
      >
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill="#2563eb"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              x: [0, Math.sin(p.id) * 30, 0],
              y: [0, -20 - p.id * 2, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Main orbital display */}
      <div style={orbitalContainerStyle}>
        {/* Outer spinning ring */}
        <motion.div
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'rgba(37, 99, 235, 0.4)',
            borderRightColor: 'rgba(37, 99, 235, 0.15)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Counter-rotating ring */}
        <motion.div
          style={{
            position: 'absolute',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: '1.5px solid transparent',
            borderBottomColor: 'rgba(139, 92, 246, 0.3)',
            borderLeftColor: 'rgba(139, 92, 246, 0.1)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Progress arc (SVG) */}
        <svg
          width="180"
          height="180"
          style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="4"
          />
          {/* Progress fill */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.5))' }}
          />
          {/* Glowing dot at progress tip */}
          <motion.circle
            cx={90 + radius * Math.cos(((clampedProgress / 100) * 360 - 90) * (Math.PI / 180))}
            cy={90 + radius * Math.sin(((clampedProgress / 100) * 360 - 90) * (Math.PI / 180))}
            r="5"
            fill="#2563eb"
            style={{ filter: 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.8))' }}
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>

        {/* Center percentage */}
        <div style={percentageStyle}>
          <motion.span
            key={Math.round(clampedProgress)}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(clampedProgress)}
          </motion.span>
          <span style={percentSignStyle}>%</span>
        </div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`orbit-${i}`}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i === 0 ? '#2563eb' : i === 1 ? '#8b5cf6' : '#10b981',
              boxShadow: `0 0 12px ${i === 0 ? '#2563eb' : i === 1 ? '#8b5cf6' : '#10b981'}`,
              top: '50%',
              left: '50%',
              transformOrigin: `0 ${-(70 + i * 10)}px`,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <motion.p
          style={labelStyle}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.p>
        {sublabel && <p style={sublabelStyle}>{sublabel}</p>}
      </div>

      {/* Bottom progress bar */}
      <div style={progressBarTrackStyle}>
        <motion.div
          style={{
            height: '100%',
            background: '#2563eb',
            borderRadius: '3px',
            position: 'relative',
            boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Shimmer sweep */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '60px',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              borderRadius: '3px',
            }}
            animate={{ left: ['-60px', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
          />
        </motion.div>
      </div>

      {/* Status dots */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`dot-${i}`}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: clampedProgress > (i + 1) * 30 ? '#2563eb' : 'rgba(255,255,255,0.15)',
            }}
            animate={clampedProgress <= (i + 1) * 30 ? { opacity: [0.3, 1, 0.3] } : {}}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
