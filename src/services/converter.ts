import { getFileCategory, getMimeType, generateOutputFilename } from './utils/formatUtils';
import { convertImage, resizeImageExact } from './processors/imageProcessor';
import {
  convertDocxToHtml,
  convertDocxToText,
  convertDocxToPdf,
  convertPdfToText,
  convertPdfToDocx,
  convertTextToPdf,
} from './processors/documentProcessor';
import { convertMedia } from './processors/mediaProcessor';

export interface ConversionResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export async function convertFile(
  file: File,
  targetFormat: string,
  options?: {
    quality?: number;
    maxSizeMB?: number;
    resizeWidth?: number;
    resizeHeight?: number;
    onProgress?: (p: number) => void;
  }
): Promise<ConversionResult> {
  const category = getFileCategory(file.type);
  const sourceExt = file.name.split('.').pop()?.toLowerCase() || '';
  const newFilename = generateOutputFilename(file.name, targetFormat);
  const targetMimeType = getMimeType(targetFormat);

  // If converting to the exact same format, and it's a document/archive/spreadsheet, 
  // just pass it through to fulfill the UI flow without corrupting it.
  if (sourceExt === targetFormat && category !== 'image' && category !== 'media') {
    if (options?.onProgress) options.onProgress(100);
    return {
      blob: file,
      filename: newFilename,
      mimeType: targetMimeType
    };
  }

  if (category === 'image') {
    if (targetFormat === 'pdf') {
       const { mergeImagesIntoPdf } = await import('./processors/imageProcessor');
       const pdfBytes = await mergeImagesIntoPdf([file]);
       return {
         blob: new Blob([pdfBytes], { type: 'application/pdf' }),
         filename: newFilename,
         mimeType: 'application/pdf'
       };
    } else {
      let finalFile = file;
      if (options?.maxSizeMB) {
        const { compressImage } = await import('./processors/imageProcessor');
        finalFile = await compressImage(file, options.maxSizeMB);
      }
      if (options?.resizeWidth && options?.resizeHeight) {
        const resizedBlob = await resizeImageExact(finalFile, options.resizeWidth, options.resizeHeight);
        finalFile = new File([resizedBlob], finalFile.name, { type: finalFile.type });
      }
      const blob = await convertImage(finalFile, targetFormat, options?.quality);
      return { blob, filename: newFilename, mimeType: targetMimeType };
    }
  }

  if (sourceExt === 'docx') {
    if (targetFormat === 'html') {
      const htmlString = await convertDocxToHtml(file);
      return {
        blob: new Blob([htmlString], { type: 'text/html' }),
        filename: newFilename,
        mimeType: 'text/html'
      };
    }
    if (targetFormat === 'txt') {
      const txtString = await convertDocxToText(file);
      return {
        blob: new Blob([txtString], { type: 'text/plain' }),
        filename: newFilename,
        mimeType: 'text/plain'
      };
    }
    if (targetFormat === 'pdf') {
      const pdfBytes = await convertDocxToPdf(file);
      return {
        blob: new Blob([pdfBytes], { type: 'application/pdf' }),
        filename: newFilename,
        mimeType: 'application/pdf'
      };
    }
  }

  if (sourceExt === 'pdf') {
    if (targetFormat === 'txt') {
      const text = await convertPdfToText(file);
      return {
        blob: new Blob([text], { type: 'text/plain' }),
        filename: newFilename,
        mimeType: 'text/plain'
      };
    }
    if (targetFormat === 'docx') {
      const blob = await convertPdfToDocx(file);
      return { blob, filename: newFilename, mimeType: targetMimeType };
    }
  }

  if (sourceExt === 'txt' && targetFormat === 'pdf') {
    const text = await file.text();
    const pdfBytes = await convertTextToPdf(text, newFilename);
    return {
      blob: new Blob([pdfBytes], { type: 'application/pdf' }),
      filename: newFilename,
      mimeType: 'application/pdf'
    };
  }

  if (category === 'media') {
    const blob = await convertMedia(file, targetFormat, options?.onProgress);
    return { blob, filename: newFilename, mimeType: targetMimeType };
  }

  throw new Error(
    `Converting .${sourceExt.toUpperCase()} to .${targetFormat.toUpperCase()} is not supported yet.`
  );
}
