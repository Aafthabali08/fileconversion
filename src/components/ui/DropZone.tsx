import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DropZoneProps {
  onDrop: (file: File) => void;
  onDropMultiple?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  onDropMultiple,
  accept,
  multiple = false,
  maxSize = 500 * 1024 * 1024, // 500MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragOver(false);
      if (acceptedFiles.length === 0) return;

      if (multiple && onDropMultiple) {
        onDropMultiple(acceptedFiles);
      } else if (acceptedFiles[0]) {
        onDrop(acceptedFiles[0]);
      }
    },
    [onDrop, onDropMultiple, multiple]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple,
    maxSize,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  const isActive = isDragActive || isDragOver;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    borderRadius: '16px',
    border: `2px dashed ${isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.15)'}`,
    background: isActive ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '220px',
    textAlign: 'center',
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#f0f0f5',
    margin: '0 0 8px 0',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  };

  const hintStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: '16px',
  };

  return (
    <motion.div
      {...(getRootProps() as any)}
      style={containerStyle as any}
      whileHover={{ borderColor: 'rgba(37, 99, 235, 0.5)' }}
      whileTap={{ scale: 0.99 }}
    >
      <input {...getInputProps()} />
      <motion.div
        style={iconContainerStyle as any}
        animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isActive ? (
          <FileIcon size={32} color="#2563eb" />
        ) : (
          <UploadCloud size={32} color="rgba(255, 255, 255, 0.6)" />
        )}
      </motion.div>

      <h3 style={titleStyle}>
        {isActive ? 'Drop your files here' : 'Drag & Drop Files'}
      </h3>
      <p style={subtitleStyle}>or click to browse your device</p>
      <p style={hintStyle}>
        Supports PDF, Images, Documents, Audio & Video • Max 500MB
      </p>
    </motion.div>
  );
};
