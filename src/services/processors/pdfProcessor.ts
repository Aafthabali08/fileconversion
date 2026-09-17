import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/** Rejects if the wrapped promise doesn't settle in time — canvas rendering
 * can stall indefinitely (e.g. a backgrounded tab), and a hung promise there
 * would otherwise freeze the UI forever with no feedback. */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  return await mergedPdf.save();
}

/**
 * Compresses a PDF toward a target byte size by rasterizing each page and
 * re-encoding as JPEG at progressively lower scale/quality, then reassembling
 * a new PDF from those images. Note: this makes text non-selectable — it's
 * the same trade-off most "compress PDF" tools make; pdf-lib alone can't
 * recompress embedded images in place.
 */
export async function compressPdfToTargetSize(
  file: File,
  targetBytes: number,
  onProgress?: (p: number) => void
): Promise<Blob> {
  const pageCount = await getPdfPageCount(file);
  if (pageCount === 0) throw new Error('Could not read this PDF.');

  const attempts = [
    { scale: 1.5, quality: 0.8 },
    { scale: 1.25, quality: 0.6 },
    { scale: 1.0, quality: 0.5 },
    { scale: 0.85, quality: 0.35 },
    { scale: 0.65, quality: 0.25 },
    { scale: 0.5, quality: 0.15 },
  ];

  let smallestBytes: Uint8Array | null = null;

  for (let attemptIndex = 0; attemptIndex < attempts.length; attemptIndex++) {
    const attempt = attempts[attemptIndex];
    if (!attempt) continue;
    const { scale, quality } = attempt;
    const pdfDoc = await PDFDocument.create();

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const { bytes, width, height } = await renderPdfPageToJpeg(file, pageNum, scale, quality);
      const image = await pdfDoc.embedJpg(bytes);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });

      if (onProgress) {
        const done = attemptIndex * pageCount + pageNum;
        onProgress(Math.min(95, (done / (attempts.length * pageCount)) * 100));
      }
    }

    const bytes = await pdfDoc.save();
    if (!smallestBytes || bytes.length < smallestBytes.length) smallestBytes = bytes;
    if (bytes.length <= targetBytes) {
      if (onProgress) onProgress(100);
      return new Blob([bytes], { type: 'application/pdf' });
    }
  }

  if (onProgress) onProgress(100);
  if (!smallestBytes) throw new Error('Failed to compress PDF.');
  return new Blob([smallestBytes], { type: 'application/pdf' });
}

export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Failed to get PDF page count', error);
    return 0;
  }
}

/** Extracts real text content from a PDF using pdfjs-dist, page by page. */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let line = '';
    const lines: string[] = [];

    for (const item of textContent.items as any[]) {
      if (!('str' in item)) continue;
      const y = item.transform?.[5] ?? null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        lines.push(line);
        line = '';
      }
      line += item.str;
      lastY = y;
    }
    if (line) lines.push(line);

    pageTexts.push(lines.join('\n'));
  }

  return pageTexts.join('\n\n');
}

async function renderPdfPageToCanvas(file: File, pageNumber: number, scale: number): Promise<HTMLCanvasElement> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  await withTimeout(
    page.render({ canvasContext: ctx, viewport }).promise,
    20000,
    'Rendering this PDF page timed out. Try again with the browser tab in the foreground.'
  );
  return canvas;
}

export async function renderPdfPageToDataUrl(file: File, pageNumber: number, scale = 2): Promise<{ dataUrl: string; width: number; height: number }> {
  const canvas = await renderPdfPageToCanvas(file, pageNumber, scale);
  return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
}

/** Rasterizes one PDF page as JPEG bytes at the given scale/quality, for size-reduction re-assembly. */
export async function renderPdfPageToJpeg(
  file: File,
  pageNumber: number,
  scale: number,
  quality: number
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const canvas = await renderPdfPageToCanvas(file, pageNumber, scale);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to encode page as JPEG'))), 'image/jpeg', quality);
  });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { bytes, width: canvas.width, height: canvas.height };
}
