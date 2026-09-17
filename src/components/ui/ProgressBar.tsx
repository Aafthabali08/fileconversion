import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'accent' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  variant = 'accent',
  size = 'md',
  animated = true,
  className = '',
  style
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const getHeight = () => {
    switch (size) {
      case 'sm': return '6px';
      case 'lg': return '14px';
      case 'md':
      default: return '10px';
    }
  };

  const getFillColor = () => {
    switch (variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'accent':
      default: return '#2563eb';
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    fontFamily: "'Inter', sans-serif",
    ...style
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500
  };

  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: getHeight(),
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: '9999px',
    overflow: 'hidden',
    position: 'relative'
  };

  const fillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: getFillColor(),
    borderRadius: '9999px',
    position: 'relative'
  };

  const stripeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
    backgroundSize: '1rem 1rem',
    animation: 'progress-stripes 1s linear infinite'
  };

  return (
    <div style={containerStyle} className={className}>
      {(label || showPercentage) && (
        <div style={headerStyle}>
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div style={trackStyle}>
        <motion.div
          style={fillStyle}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {animated && clampedProgress < 100 && (
            <>
              <style>{`
                @keyframes progress-stripes {
                  0% { background-position: 1rem 0; }
                  100% { background-position: 0 0; }
                }
              `}</style>
              <div style={stripeStyle} />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
