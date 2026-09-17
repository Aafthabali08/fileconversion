import mammoth from 'mammoth';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { extractPdfText } from './pdfProcessor';

export async function convertDocxToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

export async function convertDocxToText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function convertDocxToPdf(file: File): Promise<Uint8Array> {
  const text = await convertDocxToText(file);
  return convertTextToPdf(text, file.name);
}

export async function convertPdfToText(file: File): Promise<string> {
  return extractPdfText(file);
}

export async function convertPdfToDocx(file: File): Promise<Blob> {
  const text = await extractPdfText(file);
  const paragraphs = text
    .split(/\n+/)
    .map((line) => new Paragraph({ text: line }));

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs.length ? paragraphs : [new Paragraph({ text: '' })] }],
  });
  return Packer.toBlob(doc);
}

/** Strips characters the WinAnsi standard-font encoding can't render, to avoid pdf-lib crashes. */
function sanitizeForStandardFont(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[^\x00-\xFF\n]/g, '?');
}

export async function convertTextToPdf(rawText: string, _filename: string): Promise<Uint8Array> {
  const text = sanitizeForStandardFont(rawText);
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 50;
  
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  let currentY = height - margin;
  const maxWidth = width - margin * 2;
  
  const lines = text.split('\n');
  
  for (const line of lines) {
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth) {
        page.drawText(currentLine, { x: margin, y: currentY, size: fontSize, font });
        currentY -= fontSize + 4;
        currentLine = word;
        
        if (currentY < margin) {
          page = pdfDoc.addPage();
          currentY = height - margin;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      page.drawText(currentLine, { x: margin, y: currentY, size: fontSize, font });
      currentY -= fontSize + 4;
      
      if (currentY < margin) {
        page = pdfDoc.addPage();
        currentY = height - margin;
      }
    }
  }
  
  return await pdfDoc.save();
}

/** Extracts real text from a txt, docx, or pdf file. Throws for unsupported types. */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'txt' || file.type === 'text/plain') {
    return file.text();
  }
  if (ext === 'docx') {
    return convertDocxToText(file);
  }
  if (ext === 'pdf') {
    return extractPdfText(file);
  }
  throw new Error(`Cannot extract text from .${ext.toUpperCase()} files.`);
}

/** Merges the real extracted text of multiple txt/docx/pdf files into one .docx. */
export async function mergeIntoDocx(files: File[]): Promise<Blob> {
  const children: Paragraph[] = [];
  for (const file of files) {
    const text = await extractTextFromFile(file);
    children.push(new Paragraph({ text: file.name, heading: HeadingLevel.HEADING_2 }));
    for (const line of text.split(/\n+/)) {
      children.push(new Paragraph({ text: line }));
    }
  }
  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBlob(doc);
}

export async function mergeTextFiles(files: File[]): Promise<Blob> {
  let mergedText = '';

  for (const file of files) {
    const text = await extractTextFromFile(file);
    mergedText += `\n\n--- ${file.name} ---\n\n`;
    mergedText += text;
  }
  
  return new Blob([mergedText.trim()], { type: 'text/plain' });
}
