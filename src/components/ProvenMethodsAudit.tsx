import { useMemo, useState } from 'react';
import { load } from '../lib/storage';
import { format } from 'date-fns';
import { X } from 'lucide-react';

const METHODS_KEY = 'kaio-cooking-methods';

interface CookingAttempt {
  date: string;
  finalTemp: string;
  timeMinutes: string;
  recorder: string;
  notes: string;
  isProvingRecord?: boolean;
  holdKey?: string;
}
interface CookingMethod {
  id: string;
  dishName: string;
  method: string;
  attempts: CookingAttempt[];
  provenDate: string;
}

type Props = {
  onBack: () => void;
  recorderName?: string;
};

export default function ProvenMethodsAudit({ onBack, recorderName }: Props) {
  const methods = load<CookingMethod[]>(METHODS_KEY, []);
  const [selected, setSelected] = useState<{ methodId: string; attemptIndex: number } | null>(null);

  const flat = useMemo(() => {
    const rows: { method: CookingMethod; attempt: CookingAttempt; index: number }[] = [];
    methods.forEach((m) => {
      m.attempts.forEach((a, i) => rows.push({ method: m, attempt: a, index: i }));
    });
    return rows;
  }, [methods]);

  const byDish = useMemo(() => {
    const map = new Map<string, { method: CookingMethod; attempt: CookingAttempt; index: number }[]>();
    flat.forEach((r) => {
      const k = r.method.dishName;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    return map;
  }, [flat]);

  const selDetail = selected
    ? (() => {
        const m = methods.find((x) => x.id === selected.methodId);
        if (!m) return null;
        const a = m.attempts[selected.attemptIndex];
        return m && a ? { method: m, attempt: a } : null;
      })()
    : null;

  const bullets = (method: string) =>
    method
      .split(/\n|•/)
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <div className="audit-shell min-h-screen pb-24" style={{ color: 'var(--text-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-4" style={{ color: 'var(--text-faint)' }}>Audit report</p>

        <div
          className="rounded-2xl overflow-hidden border shadow-lg"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className="px-4 py-4 sm:px-6 flex flex-wrap items-center gap-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-alt) 100%)' }}
          >
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide shrink-0 min-h-[44px] shadow-md transition-opacity hover:opacity-95"
              style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)' }}
            >
              Return to main audit screen
            </button>
            <h1 className="flex-1 text-center text-base sm:text-lg font-bold min-w-[200px]" style={{ color: 'var(--text)' }}>
              Meat or Poultry Temperatures — Proven Methods
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row min-h-[420px]">
            <div
              className="flex-1 border-b lg:border-b-0 lg:border-r max-h-[60vh] lg:max-h-none overflow-y-auto"
              style={{ borderColor: 'var(--border)' }}
            >
              {methods.length === 0 ? (
                <p className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>No proving records yet. Add dishes under Cooking Validation.</p>
              ) : (
                Array.from(byDish.entries()).map(([dishName, rows]) => (
                  <div key={dishName}>
                    <div
                      className="px-4 py-2.5 text-sm font-bold border-b"
                      style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      {dishName}
                    </div>
                    {rows.map((r) => {
                      const d = r.attempt.date ? new Date(r.attempt.date) : new Date();
                      const label = format(d, 'do MMMM yyyy');
                      const active =
                        selected?.methodId === r.method.id && selected?.attemptIndex === r.index;
                      return (
                        <button
                          key={`${r.method.id}-${r.index}`}
                          type="button"
                          onClick={() => setSelected({ methodId: r.method.id, attemptIndex: r.index })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm border-b transition-colors"
                          style={{
                            borderColor: 'var(--border)',
                            background: active ? 'rgba(10, 94, 94, 0.08)' : 'transparent',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white" style={{ background: 'var(--navy)' }} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <aside className="w-full lg:w-[380px] shrink-0 p-5 lg:min-h-[400px]" style={{ background: 'var(--bg-card)' }}>
              {!selDetail ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a date from the list to view details.</p>
              ) : (
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                      {selDetail.attempt.date
                        ? format(new Date(selDetail.attempt.date), 'MMMM do').toUpperCase()
                        : '—'}
                    </p>
                    <button type="button" onClick={() => setSelected(null)} className="p-1 rounded-lg transition-colors hover:bg-black/5" style={{ color: 'var(--text-faint)' }} aria-label="Close">
                      <X size={18} />
                    </button>
                  </div>
                  <p className="font-bold text-lg mb-3" style={{ color: 'var(--text)' }}>{selDetail.method.dishName}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Probe Temperature: {selDetail.attempt.finalTemp || '—'}°C
                  </p>
                  <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text)' }}>
                    Core temperature held for{' '}
                    {selDetail.attempt.holdKey === '1m'
                      ? '1 minute'
                      : selDetail.attempt.holdKey === '2m'
                        ? '2 minutes'
                        : selDetail.attempt.holdKey === '30s' || !selDetail.attempt.timeMinutes
                          ? '30 seconds'
                          : `${selDetail.attempt.timeMinutes} min`}
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>Method:</p>
                    <ul className="text-sm list-disc pl-5 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      {bullets(selDetail.method.method || 'No method text stored.').map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Completed on{' '}
                    {selDetail.attempt.date
                      ? format(new Date(selDetail.attempt.date), 'MMMM do')
                      : '—'}{' '}
                    {selDetail.attempt.recorder || recorderName || ''}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>

        <p className="mt-8 text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-faint)' }}>© {new Date().getFullYear()} Kaio</p>
      </div>
    </div>
  );
}
