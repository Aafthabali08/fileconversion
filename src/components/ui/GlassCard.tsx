import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, 'padding' | 'ref'> {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'default' | 'strong' | 'subtle';
  hoverable?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', padding = 'md', variant = 'default', hoverable = true, style, ...props }, ref) => {

    const getPadding = () => {
      switch (padding) {
        case 'none': return '0';
        case 'sm': return '16px';
        case 'lg': return '32px';
        case 'md':
        default: return '24px';
      }
    };

    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'strong':
          return {
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          };
        case 'subtle':
          return {
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          };
        case 'default':
        default:
          return {
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          };
      }
    };

    const cardStyle: any = {
      ...getVariantStyles(),
      borderRadius: '16px',
      padding: getPadding(),
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    };

    return (
      <motion.div
        ref={ref}
        style={cardStyle}
        className={className}
        whileHover={hoverable ? {
          borderColor: 'rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        } : undefined}
        transition={{ duration: 0.25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
