import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#0a0e27',
    fontFamily: "'Inter', sans-serif"
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden'
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
    boxSizing: 'border-box'
  };

  const pageTitle = useMemo(() => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/convert':
        return 'Convert Files';
      case '/merge':
        return 'Merge Files';
      default:
        return 'GlassForge';
    }
  }, [location.pathname]);

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={mainStyle}>
        <Header title={pageTitle} />
        <div style={contentStyle}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
