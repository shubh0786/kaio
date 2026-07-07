import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="empty-state-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
