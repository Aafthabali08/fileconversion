export interface FileFormat {
  extension: string;
  label: string;
  mimeType: string;
  category: 'image' | 'document' | 'media' | 'spreadsheet' | 'archive' | 'unknown';
}

export const SUPPORTED_FORMATS: Record<string, FileFormat> = {
  jpg: { extension: 'jpg', label: 'JPEG Image', mimeType: 'image/jpeg', category: 'image' },
  jpeg: { extension: 'jpeg', label: 'JPEG Image', mimeType: 'image/jpeg', category: 'image' },
  png: { extension: 'png', label: 'PNG Image', mimeType: 'image/png', category: 'image' },
  webp: { extension: 'webp', label: 'WebP Image', mimeType: 'image/webp', category: 'image' },
  bmp: { extension: 'bmp', label: 'BMP Image', mimeType: 'image/bmp', category: 'image' },
  gif: { extension: 'gif', label: 'GIF Image', mimeType: 'image/gif', category: 'image' },
  pdf: { extension: 'pdf', label: 'PDF Document', mimeType: 'application/pdf', category: 'document' },
  docx: { extension: 'docx', label: 'Word Document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document' },
  txt: { extension: 'txt', label: 'Text Document', mimeType: 'text/plain', category: 'document' },
  html: { extension: 'html', label: 'HTML Document', mimeType: 'text/html', category: 'document' },
  mp4: { extension: 'mp4', label: 'MP4 Video', mimeType: 'video/mp4', category: 'media' },
  webm: { extension: 'webm', label: 'WebM Video', mimeType: 'video/webm', category: 'media' },
  avi: { extension: 'avi', label: 'AVI Video', mimeType: 'video/x-msvideo', category: 'media' },
  mp3: { extension: 'mp3', label: 'MP3 Audio', mimeType: 'audio/mpeg', category: 'media' },
  wav: { extension: 'wav', label: 'WAV Audio', mimeType: 'audio/wav', category: 'media' },
  ogg: { extension: 'ogg', label: 'OGG Audio', mimeType: 'audio/ogg', category: 'media' },
  xlsx: { extension: 'xlsx', label: 'Excel Spreadsheet', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'spreadsheet' },
  csv: { extension: 'csv', label: 'CSV File', mimeType: 'text/csv', category: 'spreadsheet' },
  ppt: { extension: 'ppt', label: 'PowerPoint Presentation', mimeType: 'application/vnd.ms-powerpoint', category: 'document' },
  pptx: { extension: 'pptx', label: 'PowerPoint Presentation', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'document' }
};

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];
// WebM/VP8 *encoding* reliably crashes the single-threaded ffmpeg.wasm core
// used here ("memory access out of bounds" — its fixed heap is too small for
// libvpx). It's excluded as an output target; mp4/avi remain fully verified.
const MEDIA_VIDEO_TARGETS = ['mp4', 'avi'];
const MEDIA_AUDIO_EXTS = ['mp3', 'wav', 'ogg'];

/** Actually-supported conversion targets per source extension, matching converter.ts's real capabilities. */
const CONVERSION_TARGETS: Record<string, string[]> = {
  jpg: [...IMAGE_EXTS, 'pdf'],
  jpeg: [...IMAGE_EXTS, 'pdf'],
  png: [...IMAGE_EXTS, 'pdf'],
  webp: [...IMAGE_EXTS, 'pdf'],
  bmp: [...IMAGE_EXTS, 'pdf'],
  gif: [...IMAGE_EXTS, 'pdf'],
  pdf: ['txt', 'docx'],
  docx: ['html', 'txt', 'pdf'],
  txt: ['pdf'],
  mp4: [...MEDIA_VIDEO_TARGETS, ...MEDIA_AUDIO_EXTS],
  webm: [...MEDIA_VIDEO_TARGETS, ...MEDIA_AUDIO_EXTS],
  avi: [...MEDIA_VIDEO_TARGETS, ...MEDIA_AUDIO_EXTS],
  mp3: MEDIA_AUDIO_EXTS,
  wav: MEDIA_AUDIO_EXTS,
  ogg: MEDIA_AUDIO_EXTS,
};

export function getConversionTargets(sourceExtension: string): FileFormat[] {
  const ext = sourceExtension.toLowerCase();
  const targets = CONVERSION_TARGETS[ext] || [];
  return targets
    .filter((t) => t !== ext)
    .map((t) => SUPPORTED_FORMATS[t])
    .filter((f): f is FileFormat => f !== undefined);
}

export function getMergeableFormats(): string[] {
  return ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'bmp', 'txt'];
}
