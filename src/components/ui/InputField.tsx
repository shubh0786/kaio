import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  helper?: string;
  error?: string;
  id?: string;
  children?: ReactNode;
}

function FieldShell({ label, helper, error, id, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="kfield-label">{label}</label>
      {children}
      {helper && !error && <p className="kfield-helper">{helper}</p>}
      {error && <p className="kfield-error">{error}</p>}
    </div>
  );
}

export function InputField({
  label,
  helper,
  error,
  id,
  className = '',
  ...rest
}: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & { id?: string }) {
  return (
    <FieldShell label={label} helper={helper} error={error} id={id}>
      <input id={id} className={`kinput ${error ? 'kinput-error' : ''} ${className}`} {...rest} />
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  label,
  helper,
  error,
  id,
  options,
  className = '',
  ...rest
}: FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & { id?: string; options: SelectOption[] }) {
  return (
    <FieldShell label={label} helper={helper} error={error} id={id}>
      <select id={id} className={`kselect ${className}`} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}
