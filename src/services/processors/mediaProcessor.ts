import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  // Using single-threaded core from CDN for broad compatibility
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
}

export async function convertMedia(file: File, targetFormat: string, onProgress?: (p: number) => void): Promise<Blob> {
  const instance = await loadFFmpeg();
  
  if (onProgress) {
    instance.on('progress', ({ progress }) => {
      onProgress(progress * 100);
    });
  }
  
  const inputName = `input_${Date.now()}.${file.name.split('.').pop()}`;
  const outputName = `output_${Date.now()}.${targetFormat}`;
  
  await instance.writeFile(inputName, await fetchFile(file));
  
  await instance.exec(['-i', inputName, outputName]);
  
  const data = await instance.readFile(outputName);
  
  // Clean up
  await instance.deleteFile(inputName);
  await instance.deleteFile(outputName);
  
  let mimeType = 'application/octet-stream';
  if (targetFormat === 'mp4') mimeType = 'video/mp4';
  if (targetFormat === 'webm') mimeType = 'video/webm';
  if (targetFormat === 'mp3') mimeType = 'audio/mpeg';
  if (targetFormat === 'wav') mimeType = 'audio/wav';
  if (targetFormat === 'gif') mimeType = 'image/gif';
  
  return new Blob([data], { type: mimeType });
}

export async function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith('audio') ? 'audio' : 'video');
    
    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(media.duration);
    };
    
    media.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    
    media.src = url;
  });
}
