import { useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { ShieldCheck, FileCheck2, AlertTriangle, Wrench, CalendarDays } from 'lucide-react';
import { Card, SectionTitle } from './ui/Card';
import { Button } from './ui/Button';
import { AlertBanner } from './ui/AlertBanner';
import EmptyState from './EmptyState';
import { gatherPack, exportVerificationPdf, type VerificationPack } from '../lib/verificationPack';

function SummaryStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="verify-stat">
      <span className="verify-stat-num" style={{ color }}>{value}</span>
      <span className="verify-stat-lbl">{label}</span>
    </div>
  );
}

export default function VerifyHome() {
  const [from, setFrom] = useState(format(subDays(new Date(), 28), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pack, setPack] = useState<VerificationPack | null>(null);
  const [busy, setBusy] = useState(false);

  const build = () => setPack(gatherPack(from, to));
  const generate = async () => {
    const p = pack || gatherPack(from, to);
    setPack(p);
    setBusy(true);
    try {
      await exportVerificationPdf(p);
    } finally {
      setBusy(false);
    }
  };

  const rangeLabel = `${format(parseISO(from), 'd MMM')} – ${format(parseISO(to), 'd MMM yyyy')}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-10">
      <h1 className="text-xl font-semibold tracking-tight mb-1" style={{ color: 'var(--text)' }}>Verification pack</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Audit-ready export for an MPI or council verifier visit.</p>

      <Card size="lg" className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={18} style={{ color: 'var(--navy)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Date range</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="kfield-label">From</label>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPack(null); }} className="kinput" />
          </div>
          <div>
            <label className="kfield-label">To</label>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPack(null); }} className="kinput" />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="secondary" size="md" onClick={build}>Preview summary</Button>
        </div>
      </Card>

      {pack ? (
        <>
          <Card size="lg" className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Summary · {rangeLabel}</p>
              <span className="status-badge badge-info">{pack.business}</span>
            </div>
            <div className="verify-stats-row">
              <SummaryStat value={pack.totalRecords} label="Total records" color="var(--text)" />
              <SummaryStat value={pack.correctiveActions} label="Corrective" color="var(--kaio-purple)" />
              <SummaryStat value={pack.reviewsOverdue} label="Overdue" color="var(--kaio-red)" />
              <SummaryStat value={pack.missingDays.length} label="Missing days" color="var(--kaio-orange)" />
            </div>
          </Card>

          <Card size="lg" className="mb-4">
            <SectionTitle className="mb-3">Included records</SectionTitle>
            <div className="space-y-2">
              {pack.sections.map((s) => (
                <div key={s.id} className="verify-row">
                  <FileCheck2 size={18} style={{ color: 'var(--text-faint)' }} />
                  <span className="verify-row-label">{s.label}</span>
                  {s.detail && <span className="verify-row-detail">{s.detail}</span>}
                  <span className="verify-row-count">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {pack.missingDays.length > 0 && (
            <div className="mb-4">
              <AlertBanner variant="warning" title={`${pack.missingDays.length} day${pack.missingDays.length > 1 ? 's' : ''} with no records`} icon={AlertTriangle}>
                No temperature or diary records on: {pack.missingDays.slice(0, 5).join(', ')}{pack.missingDays.length > 5 ? '…' : ''}
              </AlertBanner>
            </div>
          )}

          {pack.correctiveActions > 0 && (
            <div className="mb-4">
              <AlertBanner variant="danger" title={`${pack.correctiveActions} corrective action${pack.correctiveActions > 1 ? 's' : ''} recorded`} icon={Wrench}>
                Included in the pack with full details.
              </AlertBanner>
            </div>
          )}

          <Button block size="lg" icon={ShieldCheck} onClick={generate} disabled={busy}>
            {busy ? 'Generating…' : 'Generate Verification Pack'}
          </Button>
        </>
      ) : (
        <>
          <EmptyState
            icon={ShieldCheck}
            title="Pick a date range to preview"
            description="See a summary of all records, missing days, and corrective actions, then generate a single PDF for your verifier."
          />
          <Button block size="lg" icon={ShieldCheck} onClick={generate} disabled={busy} className="mt-4">
            {busy ? 'Generating…' : 'Generate Verification Pack'}
          </Button>
        </>
      )}
    </div>
  );
}
