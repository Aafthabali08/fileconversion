import React, { useState } from 'react';
import { Download, GitMerge as MergeIcon } from 'lucide-react';
import { saveAs } from 'file-saver';
import { DropZone } from '../components/ui/DropZone';
import { FileCard } from '../components/ui/FileCard';
import { MergePanel } from '../components/ui/MergePanel';
import { GameLoader } from '../components/ui/GameLoader';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { mergeFiles } from '../services/merger';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

export const MergePage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [mergeType, setMergeType] = useState<string>('pdf');
  
  // Compression settings for Merge
  const [compressionMode, setCompressionMode] = useState<'quality' | 'size'>('quality');
  const [quality, setQuality] = useState<number>(80);
  const [targetSize, setTargetSize] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB' | 'GB'>('MB');

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

  const handleFilesUpload = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
    setProgress(0);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 85));
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

      // Pass the mergeType directly as output format
      const outputFormat = mergeType;
      const mergeResult = await mergeFiles(files, outputFormat, {
        quality: compressionMode === 'quality' ? quality / 100 : undefined,
        maxSizeMB,
        onProgress: (p) => setProgress(p),
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult({ blob: mergeResult.blob, filename: mergeResult.filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed. Please try again.');
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
    setFiles([]);
    setResult(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div style={containerStyle}>
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </h3>
            {files.length > 0 && (
              <GlassButton variant="ghost" size="sm" onClick={handleReset}>
                Clear All
              </GlassButton>
            )}
          </div>
          <Reorder.Group 
            axis="y" 
            values={files} 
            onReorder={setFiles} 
            style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <AnimatePresence>
              {files.map((file, index) => (
                <Reorder.Item key={`${file.name}-${file.size}-${file.lastModified}`} value={file}>
                  <FileCard
                    file={{ name: file.name, size: file.size, type: file.type }}
                    onRemove={() => removeFile(files.findIndex(f => f === file))}
                    draggable
                  />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>
      )}

      {!result && !processing && (
        <DropZone
          onDrop={(file) => handleFilesUpload([file])}
          onDropMultiple={handleFilesUpload}
          multiple
        />
      )}

      <AnimatePresence>
        {files.length >= 2 && !result && !processing && (
          <motion.div
            key="merge-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <MergePanel
              mergeType={mergeType}
              onMergeTypeChange={setMergeType}
              compressionMode={compressionMode}
              onCompressionModeChange={setCompressionMode}
              quality={quality}
              onQualityChange={setQuality}
              targetSize={targetSize}
              onTargetSizeChange={setTargetSize}
              targetUnit={targetUnit}
              onTargetUnitChange={setTargetUnit}
              onMerge={handleMerge}
              canMerge={files.length >= 2}
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
            label="Merging your files..."
            sublabel={`Combining ${files.length} files`}
          />
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
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
                Merge Complete!
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
                  Download Merged File
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={handleReset}
                  icon={<MergeIcon size={16} />}
                >
                  Merge More Files
                </GlassButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
