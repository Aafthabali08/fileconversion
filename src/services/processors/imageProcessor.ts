import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import { getMimeType } from '../utils/formatUtils';

export async function convertImage(file: File, targetFormat: string, quality: number = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Failed to get canvas context'));
      }
      ctx.drawImage(img, 0, 0);

      const mimeType = getMimeType(targetFormat);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      }, mimeType, quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
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
