import React from 'react';
import { Gem } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const headerStyle: React.CSSProperties = {
    height: '64px',
    width: '100%',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    boxSizing: 'border-box',
  };

  const titleStyle: React.CSSProperties = {
    color: '#f0f0f5',
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
  };

  const brandStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
  };

  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>{title}</h1>
      <div style={brandStyle}>
        <Gem size={18} color="#2563eb" />
        <span>GlassForge</span>
      </div>
    </header>
  );
};
