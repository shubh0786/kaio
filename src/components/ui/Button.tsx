import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'navy' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  icon: Icon,
  children,
  className = '',
  ...rest
}: BtnProps) {
  return (
    <button
      className={`kbtn kbtn-${variant} ${size === 'lg' ? 'kbtn-lg' : ''} ${block ? 'kbtn-block' : ''} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'lg' ? 20 : 18} />}
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  className = '',
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`kicon-btn ${className}`} aria-label={label}>
      <Icon size={20} />
    </button>
  );
}
