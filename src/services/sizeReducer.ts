import { getFileCategory, getFileExtension } from './utils/formatUtils';
import { compressImage } from './processors/imageProcessor';
import { reduceMediaSize } from './processors/mediaProcessor';
import { compressPdfToTargetSize } from './processors/pdfProcessor';

export interface SizeReductionResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  originalSize: number;
  achievedSize: number;
  metTarget: boolean;
}

/**
 * Detects a file's format and shrinks it toward targetBytes using the
 * appropriate strategy for that format:
 *  - images: browser-image-compression (keeps original format)
 *  - audio/video: ffmpeg bitrate re-encode (keeps original container/codec)
 *  - PDF: rasterize + re-encode pages as JPEG at falling scale/quality
 * Any other format throws, since there's no general-purpose way to shrink
 * a text/office document losslessly on the client.
 */
export async function reduceFileSize(
  file: File,
  targetBytes: number,
  onProgress?: (p: number) => void
): Promise<SizeReductionResult> {
  if (!targetBytes || targetBytes <= 0) {
    throw new Error('Target size must be greater than 0.');
  }

  if (targetBytes >= file.size) {
    if (onProgress) onProgress(100);
    return {
      blob: file,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      originalSize: file.size,
      achievedSize: file.size,
      metTarget: true,
    };
  }

  const category = getFileCategory(file.type);
  const ext = getFileExtension(file.name);

  if (category === 'image') {
    const compressed = await compressImage(file, targetBytes / (1024 * 1024));
    if (onProgress) onProgress(100);
    return {
      blob: compressed,
      filename: file.name,
      mimeType: compressed.type || file.type,
      originalSize: file.size,
      achievedSize: compressed.size,
      metTarget: compressed.size <= targetBytes,
    };
  }

  if (category === 'media') {
    const blob = await reduceMediaSize(file, targetBytes, onProgress);
    return {
      blob,
      filename: file.name,
      mimeType: blob.type || file.type,
      originalSize: file.size,
      achievedSize: blob.size,
      metTarget: blob.size <= targetBytes,
    };
  }

  if (ext === 'pdf') {
    const blob = await compressPdfToTargetSize(file, targetBytes, onProgress);
    return {
      blob,
      filename: file.name,
      mimeType: 'application/pdf',
      originalSize: file.size,
      achievedSize: blob.size,
      metTarget: blob.size <= targetBytes,
    };
  }

  throw new Error(`Size reduction isn't supported for .${ext.toUpperCase() || 'this'} files yet.`);
}
