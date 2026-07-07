import type { LucideIcon } from 'lucide-react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

type Variant = 'info' | 'warning' | 'danger' | 'success';

const ICONS: Record<Variant, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertOctagon,
  success: CheckCircle2,
};

export function AlertBanner({
  variant = 'info',
  title,
  children,
  icon,
}: {
  variant?: Variant;
  title: string;
  children?: React.ReactNode;
  icon?: LucideIcon;
}) {
  const Icon = icon || ICONS[variant];
  return (
    <div className={`alert-banner alert-${variant}`} role="alert">
      <span className="alert-banner-icon"><Icon size={20} /></span>
      <div>
        <p className="alert-banner-title">{title}</p>
        {children && <div className="alert-banner-body">{children}</div>}
      </div>
    </div>
  );
}
