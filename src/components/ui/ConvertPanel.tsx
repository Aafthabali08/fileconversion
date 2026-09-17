import React from 'react';
import { RefreshCw, Settings, Sliders, HardDrive } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassSelect } from './GlassSelect';
import { GlassInput } from './GlassInput';
import { getConversionTargets } from '../../services/utils/conversionMap';

interface ConvertPanelProps {
  currentFormat: string;
  targetFormat: string;
  onFormatChange: (format: string) => void;

  compressionMode: 'quality' | 'size';
  onCompressionModeChange: (mode: 'quality' | 'size') => void;

  quality: number;
  onQualityChange: (quality: number) => void;

  targetSize: string;
  onTargetSizeChange: (size: string) => void;

  targetUnit: 'KB' | 'MB' | 'GB';
  onTargetUnitChange: (unit: 'KB' | 'MB' | 'GB') => void;

  isImage?: boolean;
  resizeWidth: string;
  onResizeWidthChange: (value: string) => void;
  resizeHeight: string;
  onResizeHeightChange: (value: string) => void;

  onConvert: () => void;
  canConvert: boolean;
}

export const ConvertPanel: React.FC<ConvertPanelProps> = ({
  currentFormat,
  targetFormat,
  onFormatChange,
  compressionMode,
  onCompressionModeChange,
  quality,
  onQualityChange,
  targetSize,
  onTargetSizeChange,
  targetUnit,
  onTargetUnitChange,
  isImage,
  resizeWidth,
  onResizeWidthChange,
  resizeHeight,
  onResizeHeightChange,
  onConvert,
  canConvert,
}) => {
  const targets = getConversionTargets(currentFormat);

  // Group options by category for a better UI in the dropdown
  const options = targets.map((t) => ({
    value: t.extension,
    label: `${t.label} (.${t.extension})`,
  })).sort((a, b) => a.label.localeCompare(b.label));

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
    background: 'rgba(37, 99, 235, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2563eb',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  };

  const sliderContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: '200px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    background: `linear-gradient(to right, #2563eb ${quality}%, rgba(255,255,255,0.1) ${quality}%)`,
    outline: 'none',
    cursor: 'pointer',
  };

  const qualityValueStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: '#2563eb',
    fontWeight: 600,
  };

  const currentFormatBadge: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
  };

  const arrowStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.4)',
  };

  return (
    <GlassCard padding="lg">
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>
            <Settings size={18} />
          </div>
          Conversion Settings
        </div>

        <div style={rowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={currentFormatBadge}>{currentFormat || 'N/A'}</span>
            <span style={arrowStyle}>→</span>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            {options.length > 0 ? (
              <GlassSelect
                label="Target Format"
                options={options}
                value={targetFormat}
                onChange={(e) => onFormatChange(e.target.value)}
                placeholder="Select format..."
                fullWidth
              />
            ) : (
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.875rem' }}>
                No client-side conversion formats available for <b>.{currentFormat.toUpperCase()}</b>.
              </div>
            )}
          </div>
        </div>

        {/* Compression Settings Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <GlassButton 
              variant={compressionMode === 'quality' ? 'primary' : 'secondary'} 
              size="sm" 
              onClick={() => onCompressionModeChange('quality')}
              icon={<Sliders size={14} />}
            >
              Quality %
            </GlassButton>
            <GlassButton 
              variant={compressionMode === 'size' ? 'primary' : 'secondary'} 
              size="sm" 
              onClick={() => onCompressionModeChange('size')}
              icon={<HardDrive size={14} />}
            >
              Target Size
            </GlassButton>
          </div>

          {compressionMode === 'quality' ? (
            <div style={sliderContainerStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={labelStyle}>Quality / Compression</span>
                <span style={qualityValueStyle}>{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => onQualityChange(Number(e.target.value))}
                style={sliderStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <GlassInput
                  type="number"
                  label="Target Size"
                  placeholder="e.g. 5"
                  value={targetSize}
                  onChange={(e) => onTargetSizeChange(e.target.value)}
                  min="0.1"
                  step="0.1"
                  fullWidth
                />
              </div>
              <div style={{ width: '100px' }}>
                <GlassSelect
                  value={targetUnit}
                  onChange={(e) => onTargetUnitChange(e.target.value as 'KB' | 'MB' | 'GB')}
                  options={[
                    { value: 'KB', label: 'KB' },
                    { value: 'MB', label: 'MB' },
                    { value: 'GB', label: 'GB' }
                  ]}
                  fullWidth
                />
              </div>
            </div>
          )}
        </div>

        {isImage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <span style={labelStyle}>Custom Dimensions (optional)</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <GlassInput
                  type="number"
                  label="Width (px)"
                  placeholder="e.g. 1920"
                  value={resizeWidth}
                  onChange={(e) => onResizeWidthChange(e.target.value)}
                  min="1"
                  fullWidth
                />
              </div>
              <span style={arrowStyle}>×</span>
              <div style={{ flex: 1 }}>
                <GlassInput
                  type="number"
                  label="Height (px)"
                  placeholder="e.g. 1080"
                  value={resizeHeight}
                  onChange={(e) => onResizeHeightChange(e.target.value)}
                  min="1"
                  fullWidth
                />
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
              Leave blank to keep the original size. Set both to force an exact output size.
            </span>
          </div>
        )}

        <GlassButton
          variant="primary"
          size="lg"
          onClick={onConvert}
          disabled={!canConvert || (compressionMode === 'size' && !targetSize)}
          icon={<RefreshCw size={18} />}
          fullWidth
        >
          Convert File
        </GlassButton>
      </div>
    </GlassCard>
  );
};
