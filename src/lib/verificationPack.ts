import { format, parseISO, isValid, isWithinInterval } from 'date-fns';
import { load } from './storage';
import { STORAGE_KEYS } from './storageKeys';
import { loadPdfTools, lastAutoTableY, type PdfDoc } from './exportPdf';

export interface PackSection {
  id: string;
  label: string;
  count: number;
  detail?: string;
}

export interface VerificationPack {
  business: string;
  from: string;
  to: string;
  sections: PackSection[];
  missingDays: string[];
  correctiveActions: number;
  reviewsOverdue: number;
  totalRecords: number;
}

function inRange(dateStr: string | undefined, from: string, to: string): boolean {
  if (!dateStr) return false;
  const d = parseISO(dateStr.length <= 10 ? dateStr : dateStr);
  if (!isValid(d)) return false;
  try {
    return isWithinInterval(d, { start: parseISO(from), end: parseISO(to) });
  } catch {
    return false;
  }
}

export function gatherPack(from: string, to: string): VerificationPack {
  const business = load<string>('kaio-venue-title', '') || 'Kaio venue';

  const tempRecords = load<{ date: string; correctiveAction?: string }[]>(STORAGE_KEYS.tempRecords, []);
  const tempIn = tempRecords.filter((r) => inRange(r.date, from, to));
  const units = load<unknown[]>(STORAGE_KEYS.tempUnits, []);

  const cleaning = load<{ date: string }[]>(STORAGE_KEYS.cleaningLog, []);
  const cleaningIn = cleaning.filter((c) => inRange(c.date, from, to));

  const diary = load<Record<string, unknown>>(STORAGE_KEYS.diaryChecks, {});
  const diaryDays = Object.keys(diary).filter((d) => inRange(d, from, to));

  const training = load<{ date: string }[]>(STORAGE_KEYS.trainingRecords, []);
  const trainingIn = training.filter((t) => inRange(t.date, from, to));

  const deliveries = load<{ date: string; correctiveAction?: string }[]>(STORAGE_KEYS.deliveries, []);
  const deliveriesIn = deliveries.filter((d) => inRange(d.date, from, to));
  const suppliers = load<unknown[]>(STORAGE_KEYS.suppliers, []);

  const menuItems = load<unknown[]>(STORAGE_KEYS.menuItems, []);

  const incidents = load<{ date: string; fixAction?: string }[]>(STORAGE_KEYS.incidents, []);
  const incidentsIn = incidents.filter((i) => inRange(i.date, from, to));

  const complaints = load<{ createdAt?: string; date?: string; actionTaken?: string }[]>(STORAGE_KEYS.complaints, []);
  const complaintsIn = complaints.filter((c) => inRange(c.createdAt || c.date || '', from, to));

  const calibrations = load<{ date: string; actionTaken?: string }[]>(STORAGE_KEYS.calibrations, []);
  const calIn = calibrations.filter((c) => inRange(c.date, from, to));

  const reviews = load<{ periodEnd?: string; date?: string }[]>(STORAGE_KEYS.reviews, []);
  const reviewsIn = reviews.filter((r) => inRange(r.periodEnd || r.date || '', from, to));
  const reviewsOverdue = reviews.filter((r) => {
    const days = Math.floor((Date.now() - new Date(r.periodEnd || r.date || '').getTime()) / 86400000);
    return days > 28;
  }).length;

  const correctiveActions =
    tempIn.filter((r) => r.correctiveAction).length +
    deliveriesIn.filter((r) => r.correctiveAction).length +
    calIn.filter((r) => r.actionTaken).length +
    complaintsIn.filter((r) => r.actionTaken).length +
    incidentsIn.filter((r) => r.fixAction).length;

  const sections: PackSection[] = [
    { id: 'temps', label: 'Temperature logs', count: tempIn.length, detail: `${units.length} equipment units` },
    { id: 'cleaning', label: 'Cleaning records', count: cleaningIn.length },
    { id: 'diary', label: 'Daily diary', count: diaryDays.length, detail: 'days with checks' },
    { id: 'staff', label: 'Staff training', count: trainingIn.length },
    { id: 'suppliers', label: 'Suppliers & deliveries', count: deliveriesIn.length, detail: `${suppliers.length} suppliers` },
    { id: 'allergens', label: 'Allergen records', count: menuItems.length, detail: 'menu items' },
    { id: 'incidents', label: 'Incidents', count: incidentsIn.length },
    { id: 'complaints', label: 'Complaints', count: complaintsIn.length },
    { id: 'corrective', label: 'Corrective actions', count: correctiveActions },
    { id: 'calibration', label: 'Calibration', count: calIn.length },
    { id: 'reviews', label: '4-week reviews', count: reviewsIn.length },
  ];

  // Missing days: days in range with no temp record AND no diary entry
  const allDays: string[] = [];
  let cur = parseISO(from);
  const end = parseISO(to);
  while (cur <= end) {
    const ds = format(cur, 'yyyy-MM-dd');
    const hasTemp = tempIn.some((r) => r.date === ds);
    const hasDiary = diaryDays.includes(ds);
    if (!hasTemp && !hasDiary) allDays.push(format(cur, 'd MMM yyyy'));
    cur = new Date(cur.getTime() + 86400000);
  }
  const missingDays = allDays.slice(0, 60);

  const totalRecords = sections.reduce((s, x) => s + x.count, 0);

  return { business, from, to, sections, missingDays, correctiveActions, reviewsOverdue, totalRecords };
}

export async function exportVerificationPdf(pack: VerificationPack): Promise<void> {
  const { jsPDF, autoTable } = await loadPdfTools();
  const doc: PdfDoc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Kaio Verification Pack', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${pack.business}`, 14, 27);
  doc.text(`Period: ${format(parseISO(pack.from), 'd MMM yyyy')} - ${format(parseISO(pack.to), 'd MMM yyyy')}`, 14, 33);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 39);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 46,
    head: [['Summary', 'Count']],
    body: [
      ['Total records', String(pack.totalRecords)],
      ['Corrective actions', String(pack.correctiveActions)],
      ['Reviews overdue', String(pack.reviewsOverdue)],
      ['Missing days', String(pack.missingDays.length)],
    ],
    headStyles: { fillColor: [22, 163, 74] },
    styles: { fontSize: 10 },
  });

  let y = lastAutoTableY(doc, 80) + 10;
  doc.setFontSize(13);
  doc.text('Included records', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Record category', 'Count', 'Detail']],
    body: pack.sections.map((s) => [s.label, String(s.count), s.detail || '']),
    headStyles: { fillColor: [30, 41, 59] },
    styles: { fontSize: 10 },
  });

  y = lastAutoTableY(doc, y) + 12;
  if (pack.missingDays.length > 0) {
    doc.setFontSize(13);
    doc.text('Missing record days', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(180, 30, 30);
    const cols = 3;
    pack.missingDays.slice(0, 30).forEach((d, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      doc.text(d, 14 + col * 62, y + row * 6);
    });
    if (pack.missingDays.length > 30) {
      doc.text(`...and ${pack.missingDays.length - 30} more`, 14, y + Math.ceil(Math.min(pack.missingDays.length, 30) / cols) * 6 + 2);
    }
    doc.setTextColor(0);
  }

  doc.save(`kaio-verification-pack-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
