import { Check } from 'lucide-react';

export interface StepperStep {
  label: string;
}

export function Stepper({ steps, current }: { steps: StepperStep[]; current: number }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : '';
        return (
          <div key={s.label} className="stepper-step" style={{ flex: i === steps.length - 1 ? '0 0 auto' : '1 1 auto' }}>
            <span className={`stepper-dot ${state}`}>
              {state === 'done' ? <Check size={15} /> : i + 1}
            </span>
            <span className={`stepper-label ${state === 'active' ? 'active' : ''}`}>{s.label}</span>
            {i < steps.length - 1 && <span className={`stepper-bar ${state === 'done' ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
