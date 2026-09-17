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

export function getConversionTargets(sourceExtension: string): FileFormat[] {
  const ext = sourceExtension.toLowerCase();
  
  // Return all formats so users can convert to the same format (e.g. PDF to PDF)
  return Object.values(SUPPORTED_FORMATS);
}

export function getMergeableFormats(): string[] {
  return ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'bmp', 'txt'];
}
