import React, { forwardRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    disabled,
    loading = false,
    fullWidth = false,
    icon,
    className = '',
    style,
    type = 'button',
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    const getColors = () => {
      switch (variant) {
        case 'primary': return {
          bg: '#2563eb',
          hoverBg: '#1d4ed8',
          color: '#f0f0f5',
          border: '1px solid rgba(37, 99, 235, 0.5)',
          hoverBorder: '1px solid rgba(37, 99, 235, 0.8)',
          glow: '0 0 20px rgba(37, 99, 235, 0.4), 0 0 40px rgba(37, 99, 235, 0.15)',
          hoverGlow: '0 0 24px rgba(37, 99, 235, 0.6), 0 0 48px rgba(37, 99, 235, 0.25)',
        };
        case 'secondary': return {
          bg: 'rgba(255,255,255,0.08)',
          hoverBg: 'rgba(255,255,255,0.14)',
          color: '#f0f0f5',
          border: '1px solid rgba(255,255,255,0.15)',
          hoverBorder: '1px solid rgba(255,255,255,0.3)',
          glow: 'none',
          hoverGlow: '0 0 16px rgba(255, 255, 255, 0.08)',
        };
        case 'ghost': return {
          bg: 'transparent',
          hoverBg: 'rgba(255,255,255,0.08)',
          color: '#f0f0f5',
          border: '1px solid transparent',
          hoverBorder: '1px solid rgba(255,255,255,0.12)',
          glow: 'none',
          hoverGlow: 'none',
        };
        case 'danger': return {
          bg: '#ef4444',
          hoverBg: '#dc2626',
          color: '#f0f0f5',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          hoverBorder: '1px solid rgba(239, 68, 68, 0.8)',
          glow: '0 0 16px rgba(239, 68, 68, 0.3)',
          hoverGlow: '0 0 24px rgba(239, 68, 68, 0.5), 0 0 48px rgba(239, 68, 68, 0.2)',
        };
      }
    };

    const getPadding = () => {
      switch (size) {
        case 'sm': return '8px 18px';
        case 'lg': return '14px 32px';
        case 'md':
        default: return '11px 22px';
      }
    };

    const getFontSize = () => {
      switch (size) {
        case 'sm': return '0.8125rem';
        case 'lg': return '1.0625rem';
        case 'md':
        default: return '0.9375rem';
      }
    };

    const colors = getColors();
    const isDisabled = disabled || loading;

    const buttonStyle: any = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: getPadding(),
      fontSize: getFontSize(),
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      color: colors.color,
      backgroundColor: isHovered && !isDisabled ? colors.hoverBg : colors.bg,
      border: isHovered && !isDisabled ? colors.hoverBorder : colors.border,
      borderRadius: '12px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: isHovered && !isDisabled ? colors.hoverGlow : colors.glow,
      letterSpacing: '0.01em',
      ...style,
    };

    /* Shimmer overlay on hover */
    const shimmerStyle: any = {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
      transition: 'left 0.5s ease',
      pointerEvents: 'none',
      ...(isHovered && !isDisabled ? { left: '100%' } : {}),
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        style={buttonStyle}
        className={className}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={!isDisabled ? {
          scale: 1.04,
          y: -2,
        } : {}}
        whileTap={!isDisabled ? {
          scale: 0.96,
          y: 0,
        } : {}}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
        {...props}
      >
        {/* Shimmer sweep on hover */}
        <span style={shimmerStyle} />

        {loading && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex', alignItems: 'center' } as any}
          >
            <Loader2 size={16} />
          </motion.span>
        )}
        {!loading && icon && (
          <motion.span
            style={{ display: 'flex', alignItems: 'center' }}
            animate={isHovered && !isDisabled ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {icon}
          </motion.span>
        )}
        <span style={{ position: 'relative', zIndex: 1 }}>{children as React.ReactNode}</span>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
