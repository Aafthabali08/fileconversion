import React, { forwardRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface GlassSelectOption {
  value: string;
  label: string;
}

export interface GlassSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: { value: string; label: string }[];
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ options, label, placeholder, disabled, fullWidth = false, className = '', style, ...props }, ref) => {
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

    const selectStyle: React.CSSProperties = {
      width: '100%',
      appearance: 'none',
      backgroundColor: 'rgba(255,255,255,0.06)',
      border: `1px solid ${isFocused ? '#2563eb' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '10px',
      padding: '10px 40px 10px 16px',
      color: '#f0f0f5',
      fontSize: '1rem',
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxShadow: isFocused ? '0 0 0 2px rgba(37,99,235,0.2)' : 'none'
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      right: '12px',
      color: 'rgba(255,255,255,0.6)',
      pointerEvents: 'none'
    };

    return (
      <div style={containerStyle} className={className}>
        {label && <label style={labelStyle}>{label}</label>}
        <div style={wrapperStyle}>
          <select
            ref={ref}
            style={selectStyle}
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
          >
            {placeholder && <option value="" disabled hidden>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ backgroundColor: '#0a0e27', color: '#f0f0f5' }}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown style={iconStyle} size={18} />
        </div>
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
