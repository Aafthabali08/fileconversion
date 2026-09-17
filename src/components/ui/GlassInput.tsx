import React, { forwardRef, useState } from 'react';

export interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, icon, fullWidth = false, className = '', style, disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
      fontFamily: "'Inter', sans-serif",
      ...style
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: 'rgba(255,255,255,0.6)',
      fontWeight: 500
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.06)',
      border: `1px solid ${error ? '#ef4444' : isFocused ? '#2563eb' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '10px',
      padding: `10px 16px 10px ${icon ? '40px' : '16px'}`,
      color: '#f0f0f5',
      fontSize: '1rem',
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.6 : 1,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxShadow: error ? '0 0 0 2px rgba(239,68,68,0.2)' : isFocused ? '0 0 0 2px rgba(37,99,235,0.2)' : 'none'
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      left: '12px',
      color: 'rgba(255,255,255,0.6)',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    const errorStyle: React.CSSProperties = {
      fontSize: '0.75rem',
      color: '#ef4444',
      marginTop: '4px'
    };

    return (
      <div style={containerStyle} className={className}>
        {label && <label style={labelStyle}>{label}</label>}
        <div style={wrapperStyle}>
          {icon && <div style={iconStyle}>{icon}</div>}
          <input
            ref={ref}
            style={inputStyle}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {error && <span style={errorStyle}>{error}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
