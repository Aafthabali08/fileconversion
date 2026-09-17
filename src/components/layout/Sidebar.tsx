import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gem, LayoutDashboard, RefreshCw, GitMerge } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/convert', icon: RefreshCw, label: 'Convert' },
  { to: '/merge', icon: GitMerge, label: 'Merge' },
];

export const Sidebar: React.FC = () => {
  const sidebarStyle: React.CSSProperties = {
    width: '260px',
    minWidth: '260px',
    height: '100vh',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 20px',
    boxSizing: 'border-box',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#f0f0f5',
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '48px',
    paddingLeft: '8px',
    letterSpacing: '-0.01em',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  };

  const getNavItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '13px 18px',
    borderRadius: '12px',
    textDecoration: 'none',
    color: isActive ? '#f0f0f5' : 'rgba(255,255,255,0.5)',
    background: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.9375rem',
    position: 'relative',
    overflow: 'hidden',
  });

  const footerStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.25)',
    fontSize: '0.8125rem',
    textAlign: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  };

  return (
    <div style={sidebarStyle}>
      {/* Logo with pulse animation */}
      <motion.div
        style={logoStyle}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Gem size={28} color="#2563eb" />
        </motion.div>
        <span>GlassForge</span>
      </motion.div>

      <nav style={navStyle}>
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => getNavItemStyle(isActive)}
          >
            {({ isActive }) => (
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                whileHover={{
                  x: 4,
                  transition: { duration: 0.2, type: 'spring', stiffness: 300 },
                }}
              >
                <motion.div
                  style={{ display: 'flex', alignItems: 'center' }}
                  whileHover={{ scale: 1.15, rotate: isActive ? 0 : 12 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                >
                  <item.icon size={20} />
                </motion.div>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-glow"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '12px',
                      background: 'rgba(37,99,235,0.08)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={footerStyle}>
        v1.0.0
      </div>
    </div>
  );
};
