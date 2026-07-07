import { format } from 'date-fns';
import { ListChecks, Thermometer, ArrowRight, CloudUpload } from 'lucide-react';
import { buildTodayTasks, computeCompliance } from '../lib/todayTasks';
import type { Tab } from '../lib/nav';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertBanner } from './ui/AlertBanner';
import EmptyState from './EmptyState';
import { backupStatus } from '../lib/backupStatus';

const TONE = { good: '#22c55e', warn: '#f59e0b', bad: '#ef4444' };

export default function TodayHome({
  recorder,
  onOpen,
  onChecks,
  onBackup,
}: {
  recorder: string;
  onOpen: (tab: Tab) => void;
  onChecks: () => void;
  onBackup: () => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tasks = buildTodayTasks(today);
  const c = computeCompliance(tasks);
  const bk = backupStatus();

  const chipText = c.total === 0 ? 'Set up' : c.overdue > 0 || c.pct < 60 ? 'Overdue' : c.pct < 90 ? 'Needs attention' : 'Good';
  const chipCls = c.total === 0 ? 'badge-neutral' : c.overdue > 0 || c.pct < 60 ? 'badge-danger' : c.pct < 90 ? 'badge-warn' : 'badge-success';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-10">
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase mb-1" style={{ color: 'var(--text-faint)' }}>
        {format(new Date(), 'EEEE, d MMMM yyyy')}
      </p>
      <h1 className="text-xl font-semibold tracking-tight mb-4" style={{ color: 'var(--text)' }}>
        {recorder ? `Hi, ${recorder}` : "Today's compliance"}
      </h1>

      {(bk.never || bk.stale) && (
        <div className="mb-4">
          <AlertBanner
            variant="warning"
            title={bk.never ? 'Back up your records' : 'Backup recommended'}
            icon={CloudUpload}
          >
            <button onClick={onBackup} className="underline font-semibold" style={{ color: 'inherit' }}>Back up now</button> — your data lives on this device only.
          </AlertBanner>
        </div>
      )}

      <Card size="lg" className="mb-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="today-gauge" style={{ '--pct': `${c.pct}` } as React.CSSProperties}>
              <div className="today-gauge-inner">
                <span className="today-gauge-pct">{c.pct}%</span>
                <span className="today-gauge-label">{c.insideLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`status-badge ${chipCls}`}>{chipText}</span>
            <p className="text-sm font-semibold" style={{ color: TONE[c.statusTone] }}>{c.statusLabel}</p>
          </div>
          <div className="today-progress-track">
            <div className="today-progress-fill" style={{ width: `${c.pct}%` }} />
          </div>
        </div>

        <div className="today-counts">
          <div className="today-count">
            <span className="today-count-num" style={{ color: '#22c55e' }}>{c.completed}</span>
            <span className="today-count-lbl">Completed</span>
          </div>
          <div className="today-count">
            <span className="today-count-num" style={{ color: 'var(--text-muted)' }}>{c.missing}</span>
            <span className="today-count-lbl">Missing</span>
          </div>
          <div className="today-count">
            <span className="today-count-num" style={{ color: '#ef4444' }}>{c.overdue}</span>
            <span className="today-count-lbl">Overdue</span>
          </div>
        </div>
      </Card>

      {c.total > 0 ? (
        <Button block size="lg" icon={ListChecks} onClick={onChecks}>Start today's checks</Button>
      ) : (
        <div className="mt-2">
          <EmptyState
            icon={Thermometer}
            title="No daily checks set up yet"
            description="Add your fridges and freezers to start tracking today's compliance."
            actionLabel="Set up temperatures"
            onAction={() => onOpen('temps')}
          />
        </div>
      )}

      {c.total > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="ksection-title">Due now</p>
            <button onClick={onChecks} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--navy)' }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {tasks.filter((t) => t.status !== 'completed').slice(0, 3).map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => onOpen(t.tab)} className="task-card">
                  <span className="task-card-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                    <Icon size={20} />
                  </span>
                  <span className="task-card-body">
                    <span className="task-card-title">{t.label}</span>
                    <span className="task-card-sub">{t.location}</span>
                  </span>
                  <span className="task-card-due">{t.due}</span>
                </button>
              );
            })}
            {tasks.filter((t) => t.status !== 'completed').length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Everything's done for today.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
