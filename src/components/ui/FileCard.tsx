import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  FileSpreadsheet,
  File as FileGeneric,
  X,
  GripVertical,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatFileSize } from '../../services/utils/formatUtils';

interface FileCardProps {
  file: {
    name: string;
    size: number;
    type: string;
    metadata?: Record<string, any>;
  };
  onRemove?: () => void;
  draggable?: boolean;
  onMove?: (hoverIndex: number) => void;
}

const getFileIcon = (type: string, name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) {
    return <ImageIcon size={22} color="#8b5cf6" />;
  }
  if (type.startsWith('video/') || ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext)) {
    return <Video size={22} color="#ef4444" />;
  }
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
    return <Music size={22} color="#10b981" />;
  }
  if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) {
    return <FileSpreadsheet size={22} color="#22c55e" />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx'].includes(ext)) {
    return <FileText size={22} color="#f59e0b" />;
  }
  return <FileGeneric size={22} color="rgba(255,255,255,0.6)" />;
};

const getFormatLabel = (name: string): string => {
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
  return ext;
};

export const FileCard: React.FC<FileCardProps> = ({ file, onRemove, draggable = false }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#f0f0f5',
    transition: 'all 0.2s ease',
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const infoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '0.9375rem',
    fontWeight: 500,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '4px',
    fontSize: '0.8125rem',
    color: 'rgba(255, 255, 255, 0.5)',
  };

  const badgeStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '4px',
    background: 'rgba(37, 99, 235, 0.15)',
    color: '#60a5fa',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
  };

  const removeButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  const dragHandleStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.3)',
    cursor: 'grab',
    flexShrink: 0,
  };

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      whileHover={{ background: 'rgba(255, 255, 255, 0.08)' }}
    >
      {draggable && (
        <div style={dragHandleStyle}>
          <GripVertical size={18} />
        </div>
      )}

      <div style={iconContainerStyle}>
        {getFileIcon(file.type, file.name)}
      </div>

      <div style={infoStyle}>
        <p style={nameStyle}>{file.name}</p>
        <div style={metaStyle}>
          <span style={badgeStyle}>{getFormatLabel(file.name)}</span>
          <span>{formatFileSize(file.size)}</span>
        </div>
      </div>

      {onRemove && (
        <button
          style={removeButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)';
          }}
          title="Remove file"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};
