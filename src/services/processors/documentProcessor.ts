import mammoth from 'mammoth';
import { PDFDocument, StandardFonts } from 'pdf-lib';

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

export async function convertTextToPdf(text: string, filename: string): Promise<Uint8Array> {
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

export async function mergeTextFiles(files: File[]): Promise<Blob> {
  let mergedText = '';
  
  for (const file of files) {
    const text = await file.text();
    mergedText += `\n\n--- ${file.name} ---\n\n`;
    mergedText += text;
  }
  
  return new Blob([mergedText.trim()], { type: 'text/plain' });
}
