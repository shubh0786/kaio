import { useState } from 'react';
import { Thermometer, Check, AlertTriangle } from 'lucide-react';

const QUICK = [-1, 0, 2, 3, 4, 5];

function isInRange(temp: number, min: number, max: number): boolean {
  return temp >= min && temp <= max;
}

export default function TemperatureInput({
  unitName,
  min,
  max,
  initial,
  onSave,
}: {
  unitName: string;
  min: number;
  max: number;
  initial?: string;
  onSave: (temp: number, failed: boolean) => void;
}) {
  const [val, setVal] = useState(initial || '');

  const parsed = parseFloat(val);
  const hasVal = val !== '' && !isNaN(parsed);
  const safe = hasVal && isInRange(parsed, min, max);
  const failed = hasVal && !safe;

  const setTemp = (n: number) => setVal(String(n));

  return (
    <div>
      <div className="temp-display-wrap">
        <div className={`temp-display ${!hasVal ? '' : safe ? 'temp-safe' : 'temp-failed'}`}>
          <Thermometer size={28} />
          <span className="temp-value">{hasVal ? parsed.toFixed(1) : '—'}</span>
          <span className="temp-unit">°C</span>
        </div>
      </div>

      <p className="temp-range-label">
        Safe range for {unitName}: {min}°C – {max}°C
      </p>

      {hasVal && (
        <div className={`temp-msg ${safe ? 'temp-msg-ok' : 'temp-msg-bad'}`}>
          {safe ? <><Check size={16} /> Within safe range</> : <><AlertTriangle size={16} /> Outside safe range</>}
        </div>
      )}

      <div className="temp-quick-row">
        {QUICK.map((n) => (
          <button key={n} type="button" onClick={() => setTemp(n)} className="temp-quick-btn">{n}°</button>
        ))}
      </div>

      <input
        type="number"
        inputMode="decimal"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Enter temperature"
        className="kinput temp-num-input"
        aria-label="Temperature in degrees Celsius"
      />

      <button
        type="button"
        className={`kbtn kbtn-block kbtn-lg temp-save-btn ${failed ? 'kbtn-danger' : 'kbtn-primary'}`}
        disabled={!hasVal}
        onClick={() => onSave(parsed, failed)}
      >
        {failed ? 'Record & add corrective action' : 'Save temperature'}
      </button>
    </div>
  );
}
