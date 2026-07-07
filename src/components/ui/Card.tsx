import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'lg';
  padded?: boolean;
  children: ReactNode;
}

export function Card({ size = 'sm', padded = true, children, className = '', ...rest }: CardProps) {
  const cls = `kcard ${size === 'lg' ? 'kcard-lg' : ''} ${padded ? (size === 'lg' ? 'kcard-pad-lg' : 'kcard-pad') : ''} ${className}`;
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`ksection-title ${className}`}>{children}</p>;
}
