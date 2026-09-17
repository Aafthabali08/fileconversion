import React, { useState } from 'react';
import { Chrome, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px 12px 40px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  color: '#f0f0f5',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgba(255,255,255,0.6)',
  width: '18px',
  height: '18px'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '8px',
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  transition: 'background-color 0.2s'
};

const googleButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#f0f0f5',
};

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { signInWithEmail, signInWithGoogle, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      // Error is handled in context, but we can set local state if needed
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || authError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#f0f0f5', margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>Welcome Back</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '14px' }}>Sign in to continue to GlassForge</p>
      </div>

      {displayError && (
        <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Mail style={iconStyle} />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
        </div>
        
        <div style={{ position: 'relative' }}>
          <Lock style={iconStyle} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
        </div>

        <button type="submit" style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
          Sign In
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase' }}>or</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </div>

      <button onClick={handleGoogleSignIn} style={{ ...googleButtonStyle, opacity: loading ? 0.7 : 1 }} disabled={loading}>
        <Chrome size={20} />
        Sign in with Google
      </button>

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '8px 0 0 0' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 500 }}
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
