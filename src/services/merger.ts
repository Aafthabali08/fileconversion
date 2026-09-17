import { mergePdfs } from './processors/pdfProcessor';
import { mergeImagesIntoPdf, mergeImagesIntoPptx } from './processors/imageProcessor';
import { mergeTextFiles, mergeIntoDocx } from './processors/documentProcessor';
import { concatVideos } from './processors/mediaProcessor';

export interface MergeResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

const TEXT_EXTRACTABLE_EXTS = ['txt', 'docx', 'pdf'];

export async function mergeFiles(
  files: File[],
  outputFormat: string = 'pdf',
  options?: { quality?: number; maxSizeMB?: number; onProgress?: (p: number) => void }
): Promise<MergeResult> {
  const onProgress = options?.onProgress;
  if (files.length === 0) {
    throw new Error('No files provided for merging.');
  }

  const getExt = (f: File) => f.name.split('.').pop()?.toLowerCase() || '';
  const allPdfs = files.every((f) => getExt(f) === 'pdf');
  const allImages = files.every((f) => f.type.startsWith('image/'));
  const allTextExtractable = files.every((f) => TEXT_EXTRACTABLE_EXTS.includes(getExt(f)));
  const allVideos = files.every((f) => f.type.startsWith('video/'));

  if (outputFormat === 'pdf') {
    if (allPdfs) {
      if (onProgress) onProgress(50);
      const pdfBytes = await mergePdfs(files);
      if (onProgress) onProgress(100);
      return {
        blob: new Blob([pdfBytes], { type: 'application/pdf' }),
        filename: 'merged_document.pdf',
        mimeType: 'application/pdf'
      };
    } else if (allImages) {
      if (onProgress) onProgress(50);
      const pdfBytes = await mergeImagesIntoPdf(files, options);
      if (onProgress) onProgress(100);
      return {
        blob: new Blob([pdfBytes], { type: 'application/pdf' }),
        filename: 'merged_images.pdf',
        mimeType: 'application/pdf'
      };
    }
    throw new Error('Cannot merge these file types into a PDF. Please provide all PDFs or all images.');
  }

  if (outputFormat === 'txt') {
    if (!allTextExtractable) {
      throw new Error('Merging to TXT requires all files to be TXT, DOCX, or PDF.');
    }
    if (onProgress) onProgress(50);
    const blob = await mergeTextFiles(files);
    if (onProgress) onProgress(100);
    return { blob, filename: 'merged_text.txt', mimeType: 'text/plain' };
  }

  if (outputFormat === 'docx') {
    if (!allTextExtractable) {
      throw new Error('Merging to DOCX requires all files to be TXT, DOCX, or PDF.');
    }
    if (onProgress) onProgress(50);
    const blob = await mergeIntoDocx(files);
    if (onProgress) onProgress(100);
    return {
      blob,
      filename: 'merged_document.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
  }

  if (outputFormat === 'ppt' || outputFormat === 'pptx') {
    if (!allImages) {
      throw new Error('Merging to PowerPoint requires all files to be images (one slide per image).');
    }
    if (onProgress) onProgress(50);
    const blob = await mergeImagesIntoPptx(files);
    if (onProgress) onProgress(100);
    return {
      blob,
      filename: `merged_presentation.${outputFormat}`,
      mimeType: outputFormat === 'ppt'
        ? 'application/vnd.ms-powerpoint'
        : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
  }

  if (outputFormat === 'mp4') {
    if (!allVideos) {
      throw new Error('Merging to MP4 requires all files to be videos.');
    }
    const blob = await concatVideos(files, onProgress);
    return { blob, filename: 'merged_video.mp4', mimeType: 'video/mp4' };
  }

  if (outputFormat === 'zip') {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.name, file);
    });

    if (onProgress) onProgress(40);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    }, (metadata) => {
      if (onProgress) onProgress(40 + metadata.percent * 0.6);
    });

    return {
      blob,
      filename: `merged_archive_${Date.now()}.zip`,
      mimeType: 'application/zip'
    };
  }

  throw new Error(`Merging into .${outputFormat.toUpperCase()} is not supported.`);
}
