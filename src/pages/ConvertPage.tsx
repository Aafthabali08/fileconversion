import React, { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { saveAs } from 'file-saver';
import { DropZone } from '../components/ui/DropZone';
import { FileCard } from '../components/ui/FileCard';
import { ConvertPanel } from '../components/ui/ConvertPanel';
import { GameLoader } from '../components/ui/GameLoader';
import { GlassButton } from '../components/ui/GlassButton';
import { convertFile } from '../services/converter';
import { GlassCard } from '../components/ui/GlassCard';

export interface FileInfo {
  file: File;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  formattedSize: string;
  category: string;
  metadata?: Record<string, any>;
}
import { motion, AnimatePresence } from 'framer-motion';

export const ConvertPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  
  // Compression settings
  const [compressionMode, setCompressionMode] = useState<'quality' | 'size'>('quality');
  const [quality, setQuality] = useState<number>(80);
  const [targetSize, setTargetSize] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB' | 'GB'>('MB');
  const [resizeWidth, setResizeWidth] = useState<string>('');
  const [resizeHeight, setResizeHeight] = useState<string>('');

  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    maxWidth: '800px',
    margin: '0 auto',
    color: '#f0f0f5',
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setResult(null);
    setProgress(0);
    setError(null);
    setTargetFormat('');
    setTargetSize('');
    setResizeWidth('');
    setResizeHeight('');

    setFileInfo({
      file,
      name: file.name,
      extension: file.name.split('.').pop()?.toLowerCase() || '',
      mimeType: file.type,
      size: file.size,
      formattedSize: '',
      category: 'unknown',
      metadata: {},
    });
  };

  const handleConvert = async () => {
    if (!uploadedFile || !targetFormat) return;

    setProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 8, 85));
      }, 400);

      // Calculate max size in MB if using size mode
      let maxSizeMB: number | undefined = undefined;
      if (compressionMode === 'size' && targetSize) {
        const num = parseFloat(targetSize);
        if (!isNaN(num) && num > 0) {
          if (targetUnit === 'KB') maxSizeMB = num / 1024;
          else if (targetUnit === 'MB') maxSizeMB = num;
          else if (targetUnit === 'GB') maxSizeMB = num * 1024;
        }
      }

      const width = parseInt(resizeWidth, 10);
      const height = parseInt(resizeHeight, 10);

      const conversionResult = await convertFile(uploadedFile, targetFormat, {
        quality: compressionMode === 'quality' ? quality / 100 : undefined,
        maxSizeMB,
        resizeWidth: !isNaN(width) && width > 0 ? width : undefined,
        resizeHeight: !isNaN(height) && height > 0 ? height : undefined,
        onProgress: (p) => setProgress(p),
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult({ blob: conversionResult.blob, filename: conversionResult.filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
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
    setFileInfo(null);
    setResult(null);
    setProgress(0);
    setError(null);
    setTargetFormat('');
    setResizeWidth('');
    setResizeHeight('');
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

      {uploadedFile && fileInfo && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FileCard
            file={{ name: fileInfo.name, size: fileInfo.size, type: fileInfo.mimeType, metadata: fileInfo.metadata }}
            onRemove={handleReset}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {uploadedFile && !result && !processing && (
          <motion.div
            key="convert-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ConvertPanel
              currentFormat={fileInfo?.extension || ''}
              targetFormat={targetFormat}
              onFormatChange={setTargetFormat}
              compressionMode={compressionMode}
              onCompressionModeChange={setCompressionMode}
              quality={quality}
              onQualityChange={setQuality}
              targetSize={targetSize}
              onTargetSizeChange={setTargetSize}
              targetUnit={targetUnit}
              onTargetUnitChange={setTargetUnit}
              isImage={fileInfo?.mimeType?.startsWith('image/')}
              resizeWidth={resizeWidth}
              onResizeWidthChange={setResizeWidth}
              resizeHeight={resizeHeight}
              onResizeHeightChange={setResizeHeight}
              onConvert={handleConvert}
              canConvert={!!targetFormat}
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
            label="Converting your file..."
            sublabel={`${fileInfo?.name ?? 'file'} → .${targetFormat}`}
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
              background: 'rgba(16, 185, 129, 0.06)',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Download size={28} color="#10b981" />
              </div>
              <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.25rem' }}>
                Conversion Complete!
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                {result.filename}
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
                  icon={<RefreshCw size={16} />}
                >
                  Convert Another
                </GlassButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
