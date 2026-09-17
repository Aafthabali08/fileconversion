import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { getMimeType } from '../utils/formatUtils';

// Canvas.toBlob only reliably encodes PNG/JPEG/WebP in browsers — BMP and GIF
// need to be encoded manually or the "converted" file silently contains PNG bytes.
const CANVAS_NATIVE_FORMATS = new Set(['png', 'jpg', 'jpeg', 'webp']);

function loadImage(file: File): Promise<{ img: HTMLImageElement; revoke: () => void }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const revoke = () => URL.revokeObjectURL(url);
    img.onload = () => resolve({ img, revoke });
    img.onerror = () => {
      revoke();
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function drawToCanvas(img: HTMLImageElement): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(img, 0, 0);
  return ctx;
}

/** Encodes canvas pixel data as an uncompressed 24-bit BMP. */
function encodeBmp(ctx: CanvasRenderingContext2D): Blob {
  const { width, height } = ctx.canvas;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true); // pixel data offset
  view.setUint32(14, 40, true); // DIB header size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(34, pixelArraySize, true);

  const { data } = ctx.getImageData(0, 0, width, height);
  const bytes = new Uint8Array(buffer);
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y; // BMP stores rows bottom-up
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcRow * width + x) * 4;
      const dstIdx = 54 + y * rowSize + x * 3;
      bytes[dstIdx] = data[srcIdx + 2] ?? 0; // B
      bytes[dstIdx + 1] = data[srcIdx + 1] ?? 0; // G
      bytes[dstIdx + 2] = data[srcIdx] ?? 0; // R
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/** Encodes canvas pixel data as a real single-frame GIF89a using gifenc. */
function encodeGif(ctx: CanvasRenderingContext2D): Blob {
  const { width, height } = ctx.canvas;
  const { data } = ctx.getImageData(0, 0, width, height);

  const palette = quantize(data, 256);
  const indexed = applyPalette(data, palette);

  const gif = GIFEncoder();
  gif.writeFrame(indexed, width, height, { palette });
  gif.finish();

  return new Blob([gif.bytes()], { type: 'image/gif' });
}

export async function convertImage(file: File, targetFormat: string, quality: number = 0.9): Promise<Blob> {
  const format = targetFormat.toLowerCase();

  if (!CANVAS_NATIVE_FORMATS.has(format)) {
    const { img, revoke } = await loadImage(file);
    try {
      const ctx = drawToCanvas(img);
      if (format === 'bmp') return encodeBmp(ctx);
      if (format === 'gif') return encodeGif(ctx);
      throw new Error(`Unsupported image target format: ${targetFormat}`);
    } finally {
      revoke();
    }
  }

  const { img, revoke } = await loadImage(file);
  try {
    const ctx = drawToCanvas(img);
    const mimeType = getMimeType(format);
    return await new Promise<Blob>((resolve, reject) => {
      ctx.canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      }, mimeType, quality);
    });
  } finally {
    revoke();
  }
}

export async function compressImage(file: File, maxSizeMB: number): Promise<File> {
  const options = {
    maxSizeMB,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}

export async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Failed to get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      }, file.type, 0.9);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = url;
  });
}

/** Resizes an image to the exact given dimensions (stretches if the aspect ratio differs). */
export async function resizeImageExact(file: File, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Failed to get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      }, file.type, 0.92);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = url;
  });
}

/** Builds a real PPTX with one slide per image, each image embedded full-bleed. */
export async function mergeImagesIntoPptx(files: File[]): Promise<Blob> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pres = new PptxGenJS();

  for (const file of files) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsDataURL(file);
    });

    const slide = pres.addSlide();
    slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
  }

  return pres.write({ outputType: 'blob' }) as Promise<Blob>;
}

export async function mergeImagesIntoPdf(files: File[], options?: { quality?: number; maxSizeMB?: number }): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    let finalFile = file;
    
    // Apply compression if requested
    if (options?.maxSizeMB) {
      finalFile = await compressImage(file, options.maxSizeMB);
    }
    
    const arrayBuffer = await finalFile.arrayBuffer();
    let image;
    
    if (finalFile.type === 'image/jpeg' || finalFile.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (finalFile.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // Need to convert to PNG first if not supported natively by pdf-lib
      const pngBlob = await convertImage(finalFile, 'png', options?.quality);
      const pngBuffer = await pngBlob.arrayBuffer();
      image = await pdfDoc.embedPng(pngBuffer);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return await pdfDoc.save();
}
