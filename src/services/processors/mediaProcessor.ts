import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { getMimeType } from '../utils/formatUtils';

let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const instance = new FFmpeg();

    // Must be the ESM build: our worker runs as `type: "module"`, so it loads
    // this core via dynamic import() — the UMD build isn't a valid ES module
    // and silently fails to register itself when imported that way.
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm';
    await instance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpeg = instance;
    return instance;
  })();

  try {
    return await loadingPromise;
  } catch (err) {
    // Allow retrying on the next call instead of permanently caching a failed load.
    loadingPromise = null;
    throw err;
  }
}

export async function convertMedia(file: File, targetFormat: string, onProgress?: (p: number) => void): Promise<Blob> {
  const instance = await loadFFmpeg();

  const progressHandler = onProgress
    ? ({ progress }: { progress: number }) => onProgress(progress * 100)
    : undefined;
  if (progressHandler) instance.on('progress', progressHandler);

  const inputName = `input_${Date.now()}.${file.name.split('.').pop()}`;
  const outputName = `output_${Date.now()}.${targetFormat}`;
  let data: Awaited<ReturnType<typeof instance.readFile>>;

  try {
    await instance.writeFile(inputName, await fetchFile(file));
    await instance.exec(['-i', inputName, outputName]);
    data = await instance.readFile(outputName);
  } finally {
    if (progressHandler) instance.off('progress', progressHandler);
    await instance.deleteFile(inputName).catch(() => {});
    await instance.deleteFile(outputName).catch(() => {});
  }

  const mimeType = getMimeType(targetFormat);
  
  return new Blob([data], { type: mimeType });
}

/** Concatenates multiple video files into one MP4 by re-encoding, so mismatched codecs/resolutions still work. */
export async function concatVideos(files: File[], onProgress?: (p: number) => void): Promise<Blob> {
  const instance = await loadFFmpeg();

  const progressHandler = onProgress
    ? ({ progress }: { progress: number }) => onProgress(progress * 100)
    : undefined;
  if (progressHandler) instance.on('progress', progressHandler);

  const inputNames: string[] = [];
  const outputName = `concat_output_${Date.now()}.mp4`;
  let data: Awaited<ReturnType<typeof instance.readFile>>;

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      const name = `concat_input_${i}.${file.name.split('.').pop() || 'mp4'}`;
      await instance.writeFile(name, await fetchFile(file));
      inputNames.push(name);
    }

    const inputArgs = inputNames.flatMap((name) => ['-i', name]);

    // Try concatenating video+audio first; fall back to video-only if any
    // input lacks an audio track (ffmpeg exits non-zero rather than throwing).
    const avFilter = inputNames.map((_, i) => `[${i}:v:0][${i}:a:0]`).join('');
    const avExitCode = await instance.exec([
      ...inputArgs,
      '-filter_complex',
      `${avFilter}concat=n=${inputNames.length}:v=1:a=1[outv][outa]`,
      '-map', '[outv]',
      '-map', '[outa]',
      outputName
    ]);

    if (avExitCode !== 0) {
      const vFilter = inputNames.map((_, i) => `[${i}:v:0]`).join('');
      const vExitCode = await instance.exec([
        ...inputArgs,
        '-filter_complex',
        `${vFilter}concat=n=${inputNames.length}:v=1:a=0[outv]`,
        '-map', '[outv]',
        outputName
      ]);
      if (vExitCode !== 0) {
        throw new Error('ffmpeg failed to concatenate these videos.');
      }
    }

    data = await instance.readFile(outputName);
  } finally {
    if (progressHandler) instance.off('progress', progressHandler);
    for (const name of inputNames) await instance.deleteFile(name).catch(() => {});
    await instance.deleteFile(outputName).catch(() => {});
  }

  return new Blob([data], { type: 'video/mp4' });
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
