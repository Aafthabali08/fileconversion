import React from 'react';
import { Shrink, HardDrive } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassSelect } from './GlassSelect';
import { GlassInput } from './GlassInput';

interface SizeReducerPanelProps {
  detectedFormat: string;
  isSupported: boolean;

  targetSize: string;
  onTargetSizeChange: (size: string) => void;

  targetUnit: 'KB' | 'MB';
  onTargetUnitChange: (unit: 'KB' | 'MB') => void;

  onReduce: () => void;
  canReduce: boolean;
}

export const SizeReducerPanel: React.FC<SizeReducerPanelProps> = ({
  detectedFormat,
  isSupported,
  targetSize,
  onTargetSizeChange,
  targetUnit,
  onTargetUnitChange,
  onReduce,
  canReduce,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#f0f0f5',
    margin: 0,
  };

  const iconStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10b981',
  };

  const detectedBadge: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
  };

  return (
    <GlassCard padding="lg">
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>
            <Shrink size={18} />
          </div>
          Size Reducer
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>Detected format</span>
          <span style={detectedBadge}>{detectedFormat || 'N/A'}</span>
        </div>

        {!isSupported && (
          <div style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: '0.875rem',
          }}>
            Size reduction isn't supported for <b>.{detectedFormat.toUpperCase()}</b> files yet.
            This works for images, audio, video, and PDF.
          </div>
        )}

        {isSupported && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <HardDrive size={14} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                  Custom Target Size
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <GlassInput
                    type="number"
                    placeholder="e.g. 500"
                    value={targetSize}
                    onChange={(e) => onTargetSizeChange(e.target.value)}
                    min="0.01"
                    step="0.01"
                    fullWidth
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <GlassSelect
                    value={targetUnit}
                    onChange={(e) => onTargetUnitChange(e.target.value as 'KB' | 'MB')}
                    options={[
                      { value: 'KB', label: 'KB' },
                      { value: 'MB', label: 'MB' },
                    ]}
                    fullWidth
                  />
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                The file is compressed toward this size, keeping its original format.
              </span>
            </div>

            <GlassButton
              variant="primary"
              size="lg"
              onClick={onReduce}
              disabled={!canReduce}
              icon={<Shrink size={18} />}
              style={{ backgroundColor: '#10b981', borderColor: 'rgba(16,185,129,0.5)' }}
              fullWidth
            >
              Reduce Size
            </GlassButton>
          </>
        )}
      </div>
    </GlassCard>
  );
};
