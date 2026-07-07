import { ChevronRight } from 'lucide-react';
import { MODULES, RECORDS_GROUPS, type Tab } from '../lib/nav';
import { getRecordStatus } from '../lib/recordsStatus';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { format, parseISO, isValid } from 'date-fns';

function relativeDate(d?: string): string | null {
  if (!d) return null;
  const dt = parseISO(d.length <= 10 ? d : d);
  if (!isValid(dt)) return null;
  return format(dt, 'd MMM');
}

export default function RecordsHome({ onOpen }: { onOpen: (tab: Tab) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-10">
      <h1 className="text-xl font-semibold tracking-tight mb-1" style={{ color: 'var(--text)' }}>Records</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Every food safety record, grouped.</p>

      {RECORDS_GROUPS.map((group) => (
        <section key={group.title} className="mb-7">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: 'var(--text-faint)' }}>
            {group.title}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.ids.map((id) => {
              const meta = MODULES.find((m) => m.id === id)!;
              const Icon = meta.icon;
              const st = getRecordStatus(id);
              const updated = relativeDate(st.lastUpdated);
              return (
                <button key={id} onClick={() => onOpen(id)} className="record-card">
                  <span className="record-card-icon">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className="record-card-body">
                    <span className="record-card-title">{meta.label}</span>
                    <span className="record-card-desc">{meta.desc}</span>
                    <span className="record-card-meta">
                      {updated ? `Updated ${updated}` : 'No records yet'}
                    </span>
                  </span>
                  {st.status && <StatusBadge status={st.status} />}
                  <ChevronRight size={18} style={{ color: 'var(--text-faint)' }} />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <EmptyState
        title="Records live across these modules"
        description="Tap any card to add or review records. Status badges show what's due or overdue today."
      />
    </div>
  );
}
