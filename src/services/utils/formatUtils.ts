export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  // Force minimum index to 1 (KB)
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 1) i = 1;
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
    return '';
  }
  return parts.pop()?.toLowerCase() || '';
}

export function getFileCategory(mimeType: string): 'image' | 'document' | 'media' | 'spreadsheet' | 'archive' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'media';
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('text') ||
    mimeType.includes('document') ||
    mimeType.includes('presentation')
  ) {
    return 'document';
  }
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') {
    return 'spreadsheet';
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('archive')) {
    return 'archive';
  }
  return 'unknown';
}

export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    bmp: 'image/bmp',
    gif: 'image/gif',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    mp4: 'video/mp4',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export function generateOutputFilename(originalName: string, newExtension: string): string {
  const ext = getFileExtension(originalName);
  const baseName = ext ? originalName.slice(0, -(ext.length + 1)) : originalName;
  return `${baseName}.${newExtension}`;
}
