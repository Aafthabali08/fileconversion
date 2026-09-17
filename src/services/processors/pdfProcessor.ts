import { PDFDocument } from 'pdf-lib';

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

export async function extractPdfText(file: File): Promise<string> {
  // pdf-lib does not support text extraction.
  return Promise.resolve("Text extraction is not supported client-side with pdf-lib. Please use a different library or server-side tool.");
}

// Note: pdfToImages is NOT supported client-side with pdf-lib alone.
