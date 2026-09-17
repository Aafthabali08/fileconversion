import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const loadingContainerStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#0a0e27',
};

const glassLoadingStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#2563eb'
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={glassLoadingStyle}>
          <Loader2 className="animate-spin" size={40} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return <>{children}</>;
}
