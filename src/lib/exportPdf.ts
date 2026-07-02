import { format } from 'date-fns';
import type jsPDF from 'jspdf';

export type PdfDoc = jsPDF;

export const TABLE_HEAD_STYLE = { fillColor: [30, 41, 59] as [number, number, number] };

export async function loadPdfTools() {
  const [jspdfMod, autotableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  return { jsPDF: jspdfMod.default, autoTable: autotableMod.default };
}

export function addPdfTitle(doc: PdfDoc, title: string, y = 20) {
  doc.setFontSize(16);
  doc.text(title, 14, y);
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, y + 7);
}

export function lastAutoTableY(doc: PdfDoc, fallback: number): number {
  return (doc as PdfDoc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? fallback;
}
