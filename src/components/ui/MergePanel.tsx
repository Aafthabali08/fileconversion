import React from 'react';
import { GitMerge, Settings, Sliders, HardDrive } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassSelect } from './GlassSelect';
import { GlassInput } from './GlassInput';

interface MergePanelProps {
  mergeType: string;
  onMergeTypeChange: (type: string) => void;

  compressionMode: 'quality' | 'size';
  onCompressionModeChange: (mode: 'quality' | 'size') => void;

  quality: number;
  onQualityChange: (quality: number) => void;

  targetSize: string;
  onTargetSizeChange: (size: string) => void;

  targetUnit: 'KB' | 'MB' | 'GB';
  onTargetUnitChange: (unit: 'KB' | 'MB' | 'GB') => void;

  onMerge: () => void;
  canMerge: boolean;
}

export const MergePanel: React.FC<MergePanelProps> = ({
  mergeType,
  onMergeTypeChange,
  compressionMode,
  onCompressionModeChange,
  quality,
  onQualityChange,
  targetSize,
  onTargetSizeChange,
  targetUnit,
  onTargetUnitChange,
  onMerge,
  canMerge,
}) => {
  const mergeOptions = [
    { value: 'pdf', label: 'Merge to PDF Document (.pdf)' },
    { value: 'zip', label: 'Merge to ZIP Archive (.zip)' },
    { value: 'docx', label: 'Merge to Word Document (.docx)' },
    { value: 'ppt', label: 'Merge to PowerPoint (.ppt)' },
    { value: 'txt', label: 'Merge to Text Document (.txt)' },
    { value: 'mp4', label: 'Merge to MP4 Video (.mp4)' },
  ];

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
    background: 'rgba(139, 92, 246, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8b5cf6',
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
    background: `linear-gradient(to right, #8b5cf6 ${quality}%, rgba(255,255,255,0.1) ${quality}%)`,
    outline: 'none',
    cursor: 'pointer',
  };

  const qualityValueStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: '#8b5cf6',
    fontWeight: 600,
  };

  return (
    <GlassCard padding="lg">
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>
            <Settings size={18} />
          </div>
          Output Settings
        </div>

        <GlassSelect
          label="Final Output Format"
          options={mergeOptions}
          value={mergeType}
          onChange={(e) => onMergeTypeChange(e.target.value)}
          fullWidth
        />

        {/* Compression Settings Section (mainly for images/PDFs if supported) */}
        {mergeType === 'pdf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <GlassButton 
                variant={compressionMode === 'quality' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => onCompressionModeChange('quality')}
                icon={<Sliders size={14} />}
                style={compressionMode === 'quality' ? { backgroundColor: '#8b5cf6', borderColor: 'rgba(139,92,246,0.5)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' } : {}}
              >
                Quality %
              </GlassButton>
              <GlassButton 
                variant={compressionMode === 'size' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => onCompressionModeChange('size')}
                icon={<HardDrive size={14} />}
                style={compressionMode === 'size' ? { backgroundColor: '#8b5cf6', borderColor: 'rgba(139,92,246,0.5)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' } : {}}
              >
                Target Size
              </GlassButton>
            </div>

            {compressionMode === 'quality' ? (
              <div style={sliderContainerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={labelStyle}>Image Quality (for image merges)</span>
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
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <GlassInput
                    type="number"
                    label="Final Custom Size"
                    placeholder="e.g. 10"
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
        )}

        <GlassButton
          variant="primary"
          size="lg"
          onClick={onMerge}
          disabled={!canMerge || (mergeType === 'pdf' && compressionMode === 'size' && !targetSize)}
          icon={<GitMerge size={18} />}
          style={{ backgroundColor: '#8b5cf6', borderColor: 'rgba(139,92,246,0.5)' }}
          fullWidth
        >
          Merge Files
        </GlassButton>
      </div>
    </GlassCard>
  );
};
