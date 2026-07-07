import { useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCircle2, ArrowRight, Thermometer, AlertTriangle } from 'lucide-react';
import { load, save } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/storageKeys';
import type { Unit, TemperatureRecord } from '../temp-log/types';
import { Stepper } from './ui/Stepper';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import TemperatureInput from './TemperatureInput';
import CorrectiveActionScreen from './CorrectiveActionScreen';
import EmptyState from './EmptyState';
import { saveCorrectiveAction, correctiveSummary } from '../lib/correctiveActions';

type Step = 'equipment' | 'check' | 'review' | 'corrective';
const STEPS = [{ label: 'Equipment' }, { label: 'Check' }, { label: 'Review' }];

export default function QuickTempCheck({ recorder, onDone, onManageUnits }: { recorder: string; onDone: () => void; onManageUnits: () => void }) {
  const [units] = useState<Unit[]>(() => load<Unit[]>(STORAGE_KEYS.tempUnits, []));
  const [step, setStep] = useState<Step>('equipment');
  const [unitIdx, setUnitIdx] = useState(0);
  const [lastTemp, setLastTemp] = useState<number | null>(null);
  const [lastFailed, setLastFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  if (!units.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28">
        <EmptyState
          icon={Thermometer}
          title="No equipment set up"
          description="Add fridges and freezers to run quick temperature checks."
          actionLabel="Set up temperatures"
          onAction={onManageUnits}
        />
      </div>
    );
  }

  const unit = units[unitIdx];
  const records = load<TemperatureRecord[]>(STORAGE_KEYS.tempRecords, []);

  const upsertRecord = (unitId: string, temperature: number, correctiveAction?: string) => {
    const without = records.filter((r) => !(r.unitId === unitId && r.date === today));
    const next = [...without, { unitId, date: today, temperature: String(temperature), correctiveAction }];
    save(STORAGE_KEYS.tempRecords, next);
  };

  const handleSave = (temp: number, failed: boolean) => {
    setLastTemp(temp);
    setLastFailed(failed);
    if (failed) {
      // save record with a placeholder; corrective detail added after the form
      upsertRecord(unit.id, temp, 'Corrective action pending');
      setStep('corrective');
    } else {
      upsertRecord(unit.id, temp);
      setStep('review');
      setToast(`${unit.name} check saved — ${temp.toFixed(1)}°C — Completed`);
    }
  };

  const handleCorrectiveDone = () => {
    if (lastTemp !== null) {
      const refId = `${unit.id}-${today}`;
      saveCorrectiveAction({
        module: 'temps',
        refId,
        date: today,
        whatHappened: 'Temperature out of range',
        actionTaken: 'Recorded via corrective action form',
        foodAtRisk: false,
        foodDiscarded: false,
        handledBy: recorder || 'Recorder',
        followUpNeeded: true,
      });
      upsertRecord(unit.id, lastTemp, correctiveSummary(refId));
    }
    setStep('review');
    setToast(`${unit.name} check saved — needs follow-up`);
  };

  const nextUnit = () => {
    const remaining = units.findIndex((_, i) => i > unitIdx);
    if (remaining > 0) {
      setUnitIdx(remaining);
      setLastTemp(null);
      setLastFailed(false);
      setStep('equipment');
    } else {
      onDone();
    }
  };

  const remainingCount = units.filter((u) => !records.some((r) => r.unitId === u.id && r.date === today && r.temperature)).length - (lastTemp !== null ? 1 : 0);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28 md:pb-10">
      <div className="mb-5">
        <Stepper steps={STEPS} current={step === 'equipment' ? 0 : step === 'check' || step === 'corrective' ? 1 : 2} />
      </div>

      {toast && (
        <div className="save-toast" role="status">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {step === 'equipment' && (
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Select equipment</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Choose a unit to check.</p>
          <div className="space-y-2">
            {units.map((u, i) => {
              const done = records.some((r) => r.unitId === u.id && r.date === today && r.temperature);
              return (
                <button key={u.id} onClick={() => { setUnitIdx(i); setStep('check'); }} className="task-card">
                  <span className="task-card-icon" style={{ background: done ? 'rgba(34,197,94,0.12)' : 'rgba(22,163,74,0.12)', color: done ? '#22c55e' : 'var(--navy)' }}>
                    <Thermometer size={20} />
                  </span>
                  <span className="task-card-body">
                    <span className="task-card-title">{u.name}</span>
                    <span className="task-card-sub">Safe range {u.minTemp}°C – {u.maxTemp}°C</span>
                  </span>
                  {done ? <span className="completed-check" style={{ background: '#22c55e' }}><Check size={14} color="#fff" /></span> : <ArrowRight size={18} style={{ color: 'var(--text-faint)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 'check' && (
        <Card size="lg">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>{unit.name}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Enter today's temperature.</p>
          <TemperatureInput unitName={unit.name} min={unit.minTemp} max={unit.maxTemp} onSave={handleSave} />
        </Card>
      )}

      {step === 'corrective' && lastTemp !== null && (
        <CorrectiveActionScreen
          title="Temperature is outside safe range"
          detail={`${lastTemp.toFixed(1)}°C is outside ${unit.minTemp}°C – ${unit.maxTemp}°C for ${unit.name}.`}
          module="temps"
          refId={`${unit.id}-${today}`}
          handledBy={recorder}
          onDone={handleCorrectiveDone}
        />
      )}

      {step === 'review' && lastTemp !== null && (
        <Card size="lg">
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <span className="completed-check" style={{ width: 48, height: 48, background: lastFailed ? 'var(--kaio-orange)' : '#22c55e' }}>
              {lastFailed ? <AlertTriangle /> : <Check size={24} color="#fff" />}
            </span>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{unit.name} check saved</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Temperature: {lastTemp.toFixed(1)}°C · {lastFailed ? 'Needs follow-up' : 'Completed'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {Math.max(0, remainingCount)} task{remainingCount === 1 ? '' : 's'} remaining today
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button block variant="secondary" onClick={() => { setStep('equipment'); setLastTemp(null); }}>Check another</Button>
            <Button block icon={ArrowRight} onClick={nextUnit}>{remainingCount > 0 ? 'Next' : 'Done'}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
