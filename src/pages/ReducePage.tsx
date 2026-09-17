import React, { useState } from 'react';
import { Download, Shrink } from 'lucide-react';
import { saveAs } from 'file-saver';
import { DropZone } from '../components/ui/DropZone';
import { FileCard } from '../components/ui/FileCard';
import { SizeReducerPanel } from '../components/ui/SizeReducerPanel';
import { GameLoader } from '../components/ui/GameLoader';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { reduceFileSize } from '../services/sizeReducer';
import { getFileCategory, getFileExtension, formatFileSize } from '../services/utils/formatUtils';
import { motion, AnimatePresence } from 'framer-motion';

export const ReducePage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [targetSize, setTargetSize] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('MB');

  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string; originalSize: number; achievedSize: number; metTarget: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    maxWidth: '800px',
    margin: '0 auto',
    color: '#f0f0f5',
  };

  const detectedExt = uploadedFile ? getFileExtension(uploadedFile.name) : '';
  const detectedCategory = uploadedFile ? getFileCategory(uploadedFile.type) : 'unknown';
  const isSupported = detectedCategory === 'image' || detectedCategory === 'media' || detectedExt === 'pdf';

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResult(null);
    setProgress(0);
    setError(null);
    setTargetSize('');
  };

  const handleReduce = async () => {
    if (!uploadedFile || !targetSize) return;

    const num = parseFloat(targetSize);
    if (isNaN(num) || num <= 0) return;
    const targetBytes = targetUnit === 'KB' ? num * 1024 : num * 1024 * 1024;

    setProcessing(true);
    setProgress(5);
    setError(null);

    try {
      const reduction = await reduceFileSize(uploadedFile, targetBytes, (p) => setProgress(p));
      setProgress(100);
      setResult({
        blob: reduction.blob,
        filename: reduction.filename,
        originalSize: reduction.originalSize,
        achievedSize: reduction.achievedSize,
        metTarget: reduction.metTarget,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Size reduction failed. Please try again.');
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    saveAs(result.blob, result.filename);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setResult(null);
    setProgress(0);
    setError(null);
    setTargetSize('');
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait">
        {!uploadedFile && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <DropZone onDrop={handleFileUpload} />
          </motion.div>
        )}
      </AnimatePresence>

      {uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FileCard
            file={{ name: uploadedFile.name, size: uploadedFile.size, type: uploadedFile.type }}
            onRemove={handleReset}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {uploadedFile && !result && !processing && (
          <motion.div
            key="reducer-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <SizeReducerPanel
              detectedFormat={detectedExt}
              isSupported={isSupported}
              targetSize={targetSize}
              onTargetSizeChange={setTargetSize}
              targetUnit={targetUnit}
              onTargetUnitChange={setTargetUnit}
              onReduce={handleReduce}
              canReduce={!!targetSize && parseFloat(targetSize) > 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {processing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GameLoader
            progress={progress}
            label="Reducing file size..."
            sublabel={uploadedFile?.name ?? 'file'}
          />
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <p style={{ margin: 0, color: '#ef4444', fontWeight: 500 }}>{error}</p>
              <GlassButton variant="secondary" size="sm" onClick={() => setError(null)}>
                Dismiss
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <AnimatePresence>
        {result && !processing && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              padding: '40px 32px',
              background: result.metTarget ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)',
              borderRadius: '16px',
              border: `1px solid ${result.metTarget ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: result.metTarget ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shrink size={28} color={result.metTarget ? '#10b981' : '#f59e0b'} />
              </div>
              <h3 style={{ margin: 0, color: result.metTarget ? '#10b981' : '#f59e0b', fontSize: '1.25rem' }}>
                {result.metTarget ? 'Size Reduced!' : 'Reduced as much as possible'}
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', textAlign: 'center' }}>
                {formatFileSize(result.originalSize)} → {formatFileSize(result.achievedSize)}
                {!result.metTarget && ' (could not reach your target without more quality loss)'}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={handleDownload}
                  icon={<Download size={18} />}
                >
                  Download File
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={handleReset}
                  icon={<Shrink size={16} />}
                >
                  Reduce Another
                </GlassButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
