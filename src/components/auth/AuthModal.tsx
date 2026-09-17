import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(10, 14, 39, 0.8)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '20px'
};

const modalStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '24px',
  padding: '40px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box'
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '32px'
};

export function AuthModal() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div style={overlayStyle}>
      <motion.div 
        style={modalStyle}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={logoStyle}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(37, 99, 235, 0.2)', 
            border: '1px solid rgba(37, 99, 235, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#2563eb'
          }}>
            <Diamond size={24} />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 700, 
            color: '#f0f0f5',
            letterSpacing: '-0.5px'
          }}>
            GlassForge
          </h1>
        </div>

        <div style={{ width: '100%', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm onSwitchToSignup={() => setMode('signup')} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignupForm onSwitchToLogin={() => setMode('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
