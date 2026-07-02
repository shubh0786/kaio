import { useState } from 'react';
import { ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import { AUDIT_CATEGORIES, type AuditNavAction } from '../lib/auditCategories';

type Props = {
  venueTitle?: string;
  onNavigate: (action: AuditNavAction) => void;
  onOpenKitchen: () => void;
};

export default function AuditReportHome({ venueTitle, onNavigate, onOpenKitchen }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const run = (a: AuditNavAction) => {
    if (a.type === 'kitchen') onOpenKitchen();
    else onNavigate(a);
  };

  return (
    <div className="audit-shell min-h-screen pb-28 md:pb-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 pt-6 pb-2">
        {venueTitle && (
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-faint)' }}>
            {venueTitle}
          </p>
        )}

        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--navy)' }}>
            <LayoutGrid size={18} strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>Audit report</h1>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Food safety compliance overview</p>
          </div>
        </div>

        <div className="audit-welcome px-4 py-4 sm:px-5 sm:py-5 mb-8">
          <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text)' }}>Welcome to the Audit Report.</span>{' '}
            Tap a category to open it, or expand rows that show an arrow to see linked checks and records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUDIT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const expanded = openId === cat.id;
            const hasSubs = !!cat.subs?.length;
            const toggle = () => {
              if (hasSubs) setOpenId(expanded ? null : cat.id);
              else if (cat.direct) run(cat.direct);
            };

            return (
              <div key={cat.id} className="audit-category-card overflow-hidden">
                <button
                  type="button"
                  onClick={toggle}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[56px] transition-colors rounded-[inherit]"
                  style={{ color: 'var(--text)' }}
                >
                  <span className="audit-icon-ring w-11 h-11 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white/30">
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </span>
                  <span className="flex-1 text-[12px] sm:text-[13px] font-bold tracking-[0.12em] leading-snug text-left uppercase" style={{ color: 'var(--text-secondary)' }}>
                    {cat.label}
                  </span>
                  {hasSubs && (
                    <span className="shrink-0 opacity-45" style={{ color: 'var(--navy)' }}>
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  )}
                </button>
                {expanded && hasSubs && cat.subs && (
                  <ul className="audit-sub-list">
                    {cat.subs.map((s) => (
                      <li key={s.label}>
                        <button
                          type="button"
                          className="audit-sub-btn w-full text-left px-4 py-3 text-sm border-b transition-colors last:border-b-0"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                          onClick={() => run(s.action)}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center sm:justify-between pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-faint)' }}>
            © {new Date().getFullYear()} Kaio · Food safety, sorted.
          </p>
          <button
            type="button"
            onClick={onOpenKitchen}
            className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border-2 transition-all min-h-[44px]"
            style={{
              borderColor: 'var(--navy)',
              color: 'var(--navy)',
              background: 'var(--bg-card)',
            }}
          >
            Kitchen task manager
          </button>
        </div>
      </div>
    </div>
  );
}
