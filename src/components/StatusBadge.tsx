import type { ReactNode } from 'react';

export type BadgeStatus =
  | 'completed'
  | 'due'
  | 'overdue'
  | 'failed'
  | 'needs_action'
  | 'missing'
  | 'draft'
  | 'exported';

const LABELS: Record<BadgeStatus, string> = {
  completed: 'Completed',
  due: 'Due',
  overdue: 'Overdue',
  failed: 'Failed',
  needs_action: 'Needs action',
  missing: 'Missing',
  draft: 'Draft',
  exported: 'Exported',
};

const STYLES: Record<BadgeStatus, string> = {
  completed: 'badge-success',
  due: 'badge-warn',
  overdue: 'badge-danger',
  failed: 'badge-danger',
  needs_action: 'badge-purple',
  missing: 'badge-neutral',
  draft: 'badge-neutral',
  exported: 'badge-info',
};

export default function StatusBadge({
  status,
  label,
  className = '',
}: {
  status: BadgeStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`status-badge ${STYLES[status]} ${className}`}
      aria-label={label || LABELS[status]}
    >
      {label || LABELS[status]}
    </span>
  );
}

export function StatusDot({ status }: { status: BadgeStatus }) {
  return <span className={`status-dot status-dot-${status}`} aria-hidden="true" />;
}

export const BadgeGroup = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap gap-1.5">{children}</div>
);
