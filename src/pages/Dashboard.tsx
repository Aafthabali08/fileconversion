import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, GitMerge, FileSearch, Sparkles, Zap, Shield, Shrink } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    color: '#f0f0f5',
  };

  const welcomeStyle: React.CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.05rem',
    color: 'rgba(255,255,255,0.5)',
    margin: '8px 0 0 0',
    lineHeight: 1.6,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '16px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  };

  const cardContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    padding: '28px 20px',
    cursor: 'pointer',
  };

  const iconContainerStyle = (color: string): React.CSSProperties => ({
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    background: `${color}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
  });

  const formatsGridStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  };

  const formatBadgeStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'rgba(255,255,255,0.7)',
  };

  const featureGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  };

  const featureItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
  };

  const formats = [
    'PDF', 'JPG', 'PNG', 'WEBP', 'BMP', 'GIF',
    'MP4', 'WEBM', 'MP3', 'WAV', 'OGG',
    'DOCX', 'TXT', 'XLSX', 'CSV',
  ];

  const actions = [
    {
      id: 'convert',
      title: 'Convert Files',
      description: 'Convert between 15+ formats with adjustable quality and compression.',
      icon: <RefreshCw size={30} />,
      color: '#2563eb',
      path: '/convert',
    },
    {
      id: 'merge',
      title: 'Merge Files',
      description: 'Combine multiple PDFs, images, or text files into a single document.',
      icon: <GitMerge size={30} />,
      color: '#8b5cf6',
      path: '/merge',
    },
    {
      id: 'reduce',
      title: 'Reduce Size',
      description: 'Detects the format and shrinks images, audio, video, or PDFs to a custom target size.',
      icon: <Shrink size={30} />,
      color: '#10b981',
      path: '/reduce',
    },
  ];

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 style={welcomeStyle}>
          Welcome to <span style={{ color: '#2563eb' }}>GlassForge</span>
        </h1>
        <p style={subtitleStyle}>
          Your all-in-one file conversion and merging toolkit. Fast, private, and entirely browser-based.
        </p>
      </div>

      <section>
        <h2 style={sectionTitleStyle}>Quick Actions</h2>
        <div style={gridStyle}>
          {actions.map((action, i) => (
            <motion.div
              key={action.id}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              onClick={() => navigate(action.path)}
            >
              <GlassCard>
                <div style={cardContentStyle}>
                  <div style={iconContainerStyle(action.color)}>
                    {action.icon}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{action.title}</h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {action.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Why GlassForge?</h2>
        <div style={featureGridStyle}>
          <div style={featureItemStyle}>
            <Zap size={18} color="#f59e0b" />
            <span>Lightning-fast processing</span>
          </div>
          <div style={featureItemStyle}>
            <Shield size={18} color="#10b981" />
            <span>100% client-side & private</span>
          </div>
          <div style={featureItemStyle}>
            <Sparkles size={18} color="#8b5cf6" />
            <span>No file size limits</span>
          </div>
        </div>
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Supported Formats</h2>
        <div style={formatsGridStyle}>
          {formats.map((format) => (
            <motion.div
              key={format}
              style={formatBadgeStyle}
              whileHover={{ background: 'rgba(37,99,235,0.15)', borderColor: 'rgba(37,99,235,0.3)', color: '#60a5fa' }}
            >
              {format}
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
