import { useState } from 'react';
import { Store, Thermometer, CalendarDays, Users, ChefHat, Rocket, Snowflake, Plus, X } from 'lucide-react';
import { save, saveStr, loadStr } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/storageKeys';
import type { Unit } from '../temp-log/types';
import { Stepper } from './ui/Stepper';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { InputField, SelectField } from './ui/InputField';

const STEPS = [
  { label: 'Business' },
  { label: 'Equipment' },
  { label: 'Days' },
  { label: 'Staff' },
  { label: 'Processes' },
  { label: 'Review' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BUSINESS_TYPES = ['Cafe', 'Restaurant', 'Bakery', 'Takeaway', 'Food truck', 'Other'];

export default function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [business, setBusiness] = useState(loadStr(STORAGE_KEYS.venueTitle, ''));
  const [type, setType] = useState(BUSINESS_TYPES[0]);
  const [fridges, setFridges] = useState(1);
  const [freezers, setFreezers] = useState(1);
  const [days, setDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [staff, setStaff] = useState<string[]>(['']);
  const [cooks, setCooks] = useState(true);
  const [cools, setCools] = useState(false);
  const [reheats, setReheats] = useState(false);
  const [displays, setDisplays] = useState(true);

  const toggleDay = (d: string) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const finish = () => {
    saveStr(STORAGE_KEYS.venueTitle, business || type);
    // Generate equipment units
    const units: Unit[] = [];
    for (let i = 1; i <= fridges; i++) units.push({ id: `f-${i}`, name: `Fridge ${i}`, minTemp: 0, maxTemp: 5 });
    for (let i = 1; i <= freezers; i++) units.push({ id: `z-${i}`, name: `Freezer ${i}`, minTemp: -25, maxTemp: -18 });
    if (displays) units.push({ id: 'disp-1', name: 'Display fridge', minTemp: 0, maxTemp: 5 });
    save(STORAGE_KEYS.tempUnits, units);
    // Save staff
    const cleanStaff = staff.map((s) => s.trim()).filter(Boolean);
    save(STORAGE_KEYS.staffList, cleanStaff.map((name, i) => ({
      id: `s-${i}`, name, position: '', startDate: '', email: '', phone: '',
    })));
    saveStr(STORAGE_KEYS.setupComplete, '1');
    onComplete();
  };

  const canNext = () => {
    if (step === 0) return business.trim().length > 0;
    if (step === 1) return fridges + freezers > 0;
    if (step === 3) return staff.some((s) => s.trim().length > 0);
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="max-w-xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <img src={`${import.meta.env.BASE_URL}kaio-mark.svg`} alt="Kaio" className="w-9 h-9 rounded-xl" />
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Welcome to Kaio</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Let's set up your kitchen in 2 minutes.</p>
          </div>
        </div>

        <div className="mb-6">
          <Stepper steps={STEPS} current={step} />
        </div>

        <Card size="lg" className="flex-1">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Store size={18} style={{ color: 'var(--navy)' }} /><h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Business details</h2></div>
              <InputField label="Business name" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="e.g. Majestic Cafe" helper="Shown on records and verification packs." />
              <SelectField label="Type of food business" options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))} value={type} onChange={(e) => setType(e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Thermometer size={18} style={{ color: 'var(--navy)' }} /><h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Equipment</h2></div>
              <div className="grid grid-cols-2 gap-3">
                <Counter label="Fridges" icon={Thermometer} value={fridges} setValue={setFridges} />
                <Counter label="Freezers" icon={Snowflake} value={freezers} setValue={setFreezers} />
              </div>
              <ToggleLine label="I display chilled food" on={displays} onChange={setDisplays} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>We'll create temperature units for each piece of equipment.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><CalendarDays size={18} style={{ color: 'var(--navy)' }} /><h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Opening days</h2></div>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button key={d} onClick={() => toggleDay(d)} className={`setup-day ${days.includes(d) ? 'setup-day-on' : ''}`}>{d}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Users size={18} style={{ color: 'var(--navy)' }} /><h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Staff</h2></div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add staff who'll record checks.</p>
              {staff.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s} onChange={(e) => setStaff((p) => p.map((x, j) => (j === i ? e.target.value : x)))} placeholder="Staff name" className="kinput" />
                  {staff.length > 1 && <button onClick={() => setStaff((p) => p.filter((_, j) => j !== i))} className="kicon-btn" aria-label="Remove"><X size={18} /></button>}
                </div>
              ))}
              <Button variant="secondary" icon={Plus} onClick={() => setStaff((p) => [...p, ''])}>Add staff</Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><ChefHat size={18} style={{ color: 'var(--navy)' }} /><h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Food processes</h2></div>
              <ToggleLine label="We cook food" on={cooks} onChange={setCooks} />
              <ToggleLine label="We cool food for later" on={cools} onChange={setCools} />
              <ToggleLine label="We reheat food" on={reheats} onChange={setReheats} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Rocket size={18} style={{ color: 'var(--navy)' }} /><h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Review</h2></div>
              <ReviewRow label="Business" value={business || type} />
              <ReviewRow label="Equipment" value={`${fridges} fridge(s), ${freezers} freezer(s)${displays ? ', display' : ''}`} />
              <ReviewRow label="Opening days" value={days.join(', ') || '—'} />
              <ReviewRow label="Staff" value={`${staff.filter((s) => s.trim()).length} member(s)`} />
              <ReviewRow label="Processes" value={[cooks && 'Cook', cools && 'Cool', reheats && 'Reheat'].filter(Boolean).join(', ') || 'None'} />
            </div>
          )}
        </Card>

        <div className="flex gap-2 mt-5 pb-6">
          {step > 0 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < STEPS.length - 1 ? (
            <Button block onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>Continue</Button>
          ) : (
            <Button block icon={Rocket} onClick={finish}>Generate my tasks</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Counter({ label, icon: Icon, value, setValue }: { label: string; icon: typeof Thermometer; value: number; setValue: (n: number) => void }) {
  return (
    <div className="setup-counter">
      <div className="flex items-center gap-2"><Icon size={16} style={{ color: 'var(--text-muted)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</span></div>
      <div className="flex items-center gap-3 mt-2">
        <button className="setup-step-btn" onClick={() => setValue(Math.max(0, value - 1))} aria-label={`Fewer ${label}`}>–</button>
        <span className="setup-count-num">{value}</span>
        <button className="setup-step-btn" onClick={() => setValue(value + 1)} aria-label={`More ${label}`}>+</button>
      </div>
    </div>
  );
}

function ToggleLine({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="ca-toggle w-full">
      <span className="ca-toggle-label">{label}</span>
      <span className={`toggle ${on ? 'on' : ''}`} />
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="verify-row">
      <span className="verify-row-label" style={{ flex: 1 }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{value}</span>
    </div>
  );
}
