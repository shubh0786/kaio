import { useState } from 'react';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { buildTodayTasks, type TodayTask, type TaskStatus } from '../lib/todayTasks';
import type { Tab } from '../lib/nav';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';

type Filter = 'all' | 'due' | 'completed' | 'overdue';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due', label: 'Due' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
];

const ICON_TONE: Record<TaskStatus, { bg: string; color: string }> = {
  completed: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  due: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  overdue: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  needs_action: { bg: 'rgba(168,85,247,0.12)', color: '#9333ea' },
};

const GROUP_ORDER: { key: TaskStatus; title: string }[] = [
  { key: 'overdue', title: 'Overdue' },
  { key: 'needs_action', title: 'Needs action' },
  { key: 'due', title: 'Due now' },
  { key: 'completed', title: 'Completed' },
];

export default function TodayTasks({ onOpen, onQuickTemp }: { onOpen: (tab: Tab) => void; onQuickTemp: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const tasks = buildTodayTasks();

  const visible = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'due') return t.status === 'due' || t.status === 'needs_action';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'overdue') return t.status === 'overdue';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-10">
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase mb-1" style={{ color: 'var(--text-faint)' }}>
        {format(new Date(), 'EEEE, d MMMM yyyy')}
      </p>
      <h1 className="text-xl font-semibold tracking-tight mb-4" style={{ color: 'var(--text)' }}>Today's checks</h1>

      <div className="filter-tabs mb-5">
        {FILTERS.map((f) => {
          const count = tasks.filter((t) =>
            f.id === 'all' ? true :
            f.id === 'due' ? (t.status === 'due' || t.status === 'needs_action') :
            f.id === 'completed' ? t.status === 'completed' :
            t.status === 'overdue',
          ).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-tab ${filter === f.id ? 'active' : ''}`}
            >
              {f.label} <span className="filter-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={filter === 'completed' ? 'Nothing completed yet' : filter === 'overdue' ? 'No overdue tasks' : 'No tasks here'}
          description={filter === 'all' ? 'Set up temperature units to generate today’s checks.' : undefined}
          actionLabel={tasks.length === 0 ? 'Set up temperatures' : undefined}
          onAction={tasks.length === 0 ? () => onOpen('temps') : undefined}
        />
      ) : (
        <div className="space-y-5">
          {GROUP_ORDER.map((g) => {
            const groupTasks = visible.filter((t) => t.status === g.key);
            if (!groupTasks.length) return null;
            return (
              <section key={g.key}>
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2.5" style={{ color: 'var(--text-faint)' }}>
                  {g.title}
                </p>
                <div className="space-y-2">
                  {groupTasks.map((t) => (
                    <TaskRow key={t.id} task={t} onOpen={() => (t.tab === 'temps' ? onQuickTemp() : onOpen(t.tab))} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onOpen }: { task: TodayTask; onOpen: () => void }) {
  const Icon = task.icon;
  const tone = ICON_TONE[task.status];
  return (
    <button onClick={onOpen} className="task-card">
      <span className="task-card-icon" style={{ background: tone.bg, color: tone.color }}>
        <Icon size={20} />
      </span>
      <span className="task-card-body">
        <span className="task-card-title">{task.label}</span>
        <span className="task-card-sub">{task.location}</span>
      </span>
      {task.status === 'completed' ? (
        <span className="task-card-status">
          <span className="completed-check" style={{ background: '#22c55e' }}><Check size={14} color="#fff" /></span>
        </span>
      ) : (
        <>
          <StatusBadge status={task.status === 'due' ? 'due' : task.status === 'overdue' ? 'overdue' : 'needs_action'} />
        </>
      )}
    </button>
  );
}
