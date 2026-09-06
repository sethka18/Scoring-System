import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

export interface PdfExportOptions {
  fileName?: string;
  pageSize?: 'a4' | 'a5' | 'letter';
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  scale?: number;
  onProgress?: (progressText: string) => void;
}

/**
 * Dimensions in millimeters for standard paper sizes
 */
const PAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 215.9, height: 279.4 },
};

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Exports a single DOM element directly into a downloadable PDF file.
 */
export async function exportElementToPdf(
  elementOrId: HTMLElement | string,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    fileName = 'Official_Document.pdf',
    pageSize = 'a4',
    orientation = 'portrait',
    marginMm = 8,
    scale = 2,
    onProgress,
  } = options;

  const element = typeof elementOrId === 'string' 
    ? document.getElementById(elementOrId) 
    : elementOrId;

  if (!element) {
    console.error(`[pdfExport] Element not found: ${elementOrId}`);
    return false;
  }

  try {
    if (onProgress) onProgress('Preparing document for PDF generation...');

    // Wait for fonts to load
    await document.fonts?.ready;

    if (onProgress) onProgress('Rendering high-resolution vector snapshot...');

    const imgData = await toJpeg(element, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: scale,
      cacheBust: true,
    });

    const { width: pixelWidth, height: pixelHeight } = await getImageDimensions(imgData);

    if (onProgress) onProgress('Constructing PDF file...');

    const pageDim = PAGE_DIMENSIONS[pageSize] || PAGE_DIMENSIONS.a4;
    const pageWidth = orientation === 'portrait' ? pageDim.width : pageDim.height;
    const pageHeight = orientation === 'portrait' ? pageDim.height : pageDim.width;

    const printableWidth = pageWidth - (marginMm * 2);
    const printableHeight = pageHeight - (marginMm * 2);

    const imgWidth = printableWidth;
    const imgHeight = (pixelHeight * printableWidth) / pixelWidth;

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize,
      compress: true,
    });

    let heightLeft = imgHeight;
    let position = marginMm;

    // First page
    pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= printableHeight;

    // Extra pages if content overflows
    while (heightLeft > 0) {
      position = position - printableHeight;
      pdf.addPage(pageSize, orientation);
      pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= printableHeight;
    }

    if (onProgress) onProgress('Saving PDF file...');

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);

    return true;
  } catch (error) {
    console.error('[pdfExport] Error generating PDF:', error);
    return false;
  }
}

/**
 * Exports multiple DOM elements into a single multi-page consolidated PDF file.
 */
export async function exportMultipleElementsToPdf(
  elementsOrIds: (HTMLElement | string)[],
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    fileName = 'Batch_Records_Consolidated.pdf',
    pageSize = 'a5',
    orientation = 'portrait',
    marginMm = 6,
    scale = 2,
    onProgress,
  } = options;

  if (!elementsOrIds.length) return false;

  try {
    const pageDim = PAGE_DIMENSIONS[pageSize] || PAGE_DIMENSIONS.a5;
    const pageWidth = orientation === 'portrait' ? pageDim.width : pageDim.height;
    const pageHeight = orientation === 'portrait' ? pageDim.height : pageDim.width;

    const printableWidth = pageWidth - (marginMm * 2);

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize,
      compress: true,
    });

    await document.fonts?.ready;

    let renderedCount = 0;

    for (let i = 0; i < elementsOrIds.length; i++) {
      const target = elementsOrIds[i];
      const el = typeof target === 'string' ? document.getElementById(target) : target;
      if (!el) continue;

      if (onProgress) {
        onProgress(`Processing document ${i + 1} of ${elementsOrIds.length}...`);
      }

      const imgData = await toJpeg(el, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: scale,
        cacheBust: true,
      });

      const { width: pixelWidth, height: pixelHeight } = await getImageDimensions(imgData);
      const imgWidth = printableWidth;
      const imgHeight = (pixelHeight * printableWidth) / pixelWidth;

      if (renderedCount > 0) {
        pdf.addPage(pageSize, orientation);
      }

      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, imgWidth, imgHeight, undefined, 'FAST');
      renderedCount++;
    }

    if (renderedCount === 0) return false;

    if (onProgress) onProgress('Finalizing and downloading PDF...');

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);

    return true;
  } catch (error) {
    console.error('[pdfExport] Batch PDF generation error:', error);
    return false;
  }
}
