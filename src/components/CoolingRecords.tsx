import { useState, useCallback } from 'react';
import { load, save } from '../lib/storage';
import {
  Snowflake, CalendarDays, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Timer, Info, FileText, ArrowDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { loadPdfTools, addPdfTitle, TABLE_HEAD_STYLE, lastAutoTableY } from '../lib/exportPdf';
import { STORAGE_KEYS } from '../lib/storageKeys';

interface CoolingAttempt {
  date: string;
  startTemp: string;
  startTime: string;
  midTemp: string;
  midTime: string;
  endTemp: string;
  endTime: string;
  recorder: string;
  notes: string;
}

interface CoolingMethod {
  id: string;
  dishName: string;
  method: string;
  attempts: CoolingAttempt[];
  provenDate: string;
}

interface WeeklyCoolingCheck {
  id: string;
  dishId: string;
  date: string;
  startTemp: string;
  endTemp: string;
  duration: string;
  passed: boolean;
  recorder: string;
  notes: string;
}

const METHODS_KEY = STORAGE_KEYS.coolingMethods;
const CHECKS_KEY = STORAGE_KEYS.weeklyCoolingChecks;

function emptyMethod(): CoolingMethod {
  return { id: '', dishName: '', method: '', attempts: [], provenDate: '' };
}

function emptyAttempt(recorder: string): CoolingAttempt {
  return {
    date: format(new Date(), 'yyyy-MM-dd'), startTemp: '', startTime: '',
    midTemp: '', midTime: '', endTemp: '', endTime: '', recorder, notes: '',
  };
}

function emptyCheck(recorder: string): WeeklyCoolingCheck {
  return {
    id: '', dishId: '', date: format(new Date(), 'yyyy-MM-dd'),
    startTemp: '', endTemp: '', duration: '', passed: true, recorder, notes: '',
  };
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', inputMode }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        inputMode={inputMode}
        className="glass-input w-full min-h-[44px] px-4 rounded-xl" style={{ color: 'var(--text)' }} />
    </div>
  );
}

function AreaField({ label, value, onChange, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
        className="glass-input w-full min-h-[44px] px-4 py-3 rounded-xl resize-y" style={{ color: 'var(--text)' }} />
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-sm flex items-center gap-2 shrink-0" style={{ color: 'var(--text-muted)' }}>{icon}{label}</span>
      <span className="text-sm font-medium text-right truncate min-w-0" style={{ color: 'var(--text)' }}>{value || '—'}</span>
    </div>
  );
}

export default function CoolingRecords({ recorder }: { recorder: string }) {
  const [methods, setMethods] = useState<CoolingMethod[]>(() => load(METHODS_KEY, []));
  const [checks, setChecks] = useState<WeeklyCoolingCheck[]>(() => load(CHECKS_KEY, []));
  const [activeTab, setActiveTab] = useState<'prove' | 'weekly'>('prove');
  const [showSheet, setShowSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState<'dish' | 'attempt' | 'check'>('dish');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const [dishForm, setDishForm] = useState(emptyMethod());
  const [attemptForm, setAttemptForm] = useState(emptyAttempt(recorder));
  const [attemptDishId, setAttemptDishId] = useState('');
  const [checkForm, setCheckForm] = useState(emptyCheck(recorder));

  const persistMethods = useCallback((m: CoolingMethod[]) => { setMethods(m); save(METHODS_KEY, m); }, []);
  const persistChecks = useCallback((c: WeeklyCoolingCheck[]) => { setChecks(c); save(CHECKS_KEY, c); }, []);

  const openAddDish = () => { setDishForm(emptyMethod()); setSheetMode('dish'); setShowSheet(true); };
  const openAddAttempt = (dishId: string) => { setAttemptDishId(dishId); setAttemptForm(emptyAttempt(recorder)); setSheetMode('attempt'); setShowSheet(true); };
  const openAddCheck = () => { setCheckForm(emptyCheck(recorder)); setSheetMode('check'); setShowSheet(true); };

  const saveDish = () => {
    if (!dishForm.dishName.trim()) return;
    persistMethods([...methods, { ...dishForm, id: crypto.randomUUID() }]);
    setShowSheet(false);
  };

  const deleteDish = (id: string) => {
    if (!confirm('Delete this dish and all its cooling attempts?')) return;
    persistMethods(methods.filter(m => m.id !== id));
  };

  const saveAttempt = () => {
    if (!attemptForm.startTemp || !attemptForm.startTime) return;
    persistMethods(methods.map(m => {
      if (m.id !== attemptDishId) return m;
      const updated = { ...m, attempts: [...m.attempts, attemptForm] };
      if (updated.attempts.length >= 3 && !updated.provenDate) {
        updated.provenDate = format(new Date(), 'yyyy-MM-dd');
      }
      return updated;
    }));
    setShowSheet(false);
  };

  const deleteAttempt = (dishId: string, idx: number) => {
    persistMethods(methods.map(m => {
      if (m.id !== dishId) return m;
      const updated = { ...m, attempts: m.attempts.filter((_, i) => i !== idx) };
      if (updated.attempts.length < 3) updated.provenDate = '';
      return updated;
    }));
  };

  const saveCheck = () => {
    if (!checkForm.dishId || !checkForm.startTemp) return;
    persistChecks([{ ...checkForm, id: crypto.randomUUID(), recorder }, ...checks]);
    setShowSheet(false);
  };

  const deleteCheck = (id: string) => {
    if (!confirm('Delete this weekly check?')) return;
    persistChecks(checks.filter(c => c.id !== id));
  };

  const getDishName = (id: string) => methods.find(m => m.id === id)?.dishName || 'Unknown';

  const provenMethods = methods.filter(m => m.provenDate);

  const exportPDF = async () => {
    const { jsPDF, autoTable } = await loadPdfTools();
    const doc = new jsPDF();
    addPdfTitle(doc, 'Cooling Records — TFCP CAR 5');

    if (methods.length > 0) {
      doc.setFontSize(12);
      doc.text('Proven Cooling Methods', 14, 36);

      autoTable(doc, {
        startY: 40,
        head: [['Dish', 'Method', 'Attempts', 'Proven Date']],
        body: methods.map(m => [
          m.dishName,
          m.method,
          `${m.attempts.length}/3`,
          m.provenDate || 'Not yet proven',
        ]),
        styles: { fontSize: 8 },
        headStyles: TABLE_HEAD_STYLE,
      });
    }

    if (checks.length > 0) {
      const afterMethods = lastAutoTableY(doc, 36);
      doc.setFontSize(12);
      doc.text('Weekly Cooling Checks', 14, afterMethods + 12);

      autoTable(doc, {
        startY: afterMethods + 16,
        head: [['Date', 'Dish', 'Start °C', 'End °C', 'Duration', 'Pass', 'Recorder', 'Notes']],
        body: checks.map(c => [
          c.date, getDishName(c.dishId), `${c.startTemp}°C`, `${c.endTemp}°C`,
          c.duration, c.passed ? 'Pass' : 'Fail', c.recorder, c.notes || '—',
        ]),
        styles: { fontSize: 8 },
        headStyles: TABLE_HEAD_STYLE,
      });
    }

    doc.save(`cooling-records-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-4 content-area px-4 p-4 pb-24 min-h-screen" style={{ background: 'var(--bg-alt)' }}>
      <div className="section-header flex items-center gap-2">
        <Snowflake className="w-5 h-5" style={{ color: 'var(--navy)' }} />
        Cooling Records
      </div>

      {/* TFCP Rules Card */}
      <div className="card rounded-2xl overflow-hidden shadow-sm">
        <button type="button" onClick={() => setRulesOpen(!rulesOpen)}
          className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Info size={16} style={{ color: 'var(--navy)' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>TFCP Cooling Rules (CAR 5)</span>
          </div>
          {rulesOpen ? <ChevronUp size={18} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-faint)' }} />}
        </button>
        {rulesOpen && (
          <div className="px-4 pb-4 pt-0 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-start gap-2 mt-3">
              <ArrowDown size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--navy)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong>60°C → 20°C</strong> within <strong>2 hours</strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <ArrowDown size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--navy)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong>20°C → 5°C</strong> within <strong>4 hours</strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Timer size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--navy)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong>Total max 6 hours</strong> from 60°C to 5°C
              </p>
            </div>
            <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--bg-alt)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                You must <strong>prove your cooling method works 3 times</strong>, then validate it <strong>weekly</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setActiveTab('prove')}
          className={`flex-1 min-h-[44px] px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'prove' ? 'btn-primary' : 'btn-outline'}`}>
          <Snowflake size={16} /> Prove Method
        </button>
        <button type="button" onClick={() => setActiveTab('weekly')}
          className={`flex-1 min-h-[44px] px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'weekly' ? 'btn-primary' : 'btn-outline'}`}>
          <CalendarDays size={16} /> Weekly Checks
        </button>
      </div>

      {/* Export */}
      {(methods.length > 0 || checks.length > 0) && (
        <div className="flex justify-end">
          <button type="button" onClick={exportPDF}
            className="btn-outline min-h-[36px] px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0">
            <FileText size={14} /> Export PDF
          </button>
        </div>
      )}

      {/* Prove Method Tab */}
      {activeTab === 'prove' && (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Prove each cooling method works by recording 3 successful attempts with temperature checkpoints.
          </p>
          {methods.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center shadow-sm">
              <Snowflake size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No cooling methods added yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Tap + to add a dish and its cooling method</p>
            </div>
          ) : (
            methods.map(m => {
              const isExpanded = expandedId === m.id;
              const proven = m.attempts.length >= 3;
              const progress = Math.min(m.attempts.length, 3);
              return (
                <div key={m.id} className="card rounded-2xl overflow-hidden shadow-sm">
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: proven ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)' }}>
                          {proven ? <CheckCircle2 size={16} className="text-green-500" /> : <Snowflake size={16} className="text-amber-500" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{m.dishName}</p>
                            {proven && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full badge-success shrink-0">
                                PROVEN
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {m.method || 'No method described'} · {progress}/3 attempts
                          </p>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-faint)' }} />}
                  </button>

                  {/* Progress bar */}
                  <div className="px-4 pb-2">
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${(progress / 3) * 100}%`,
                        background: proven ? '#22c55e' : 'var(--gold)',
                      }} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                      {m.provenDate && (
                        <DetailRow label="Proven Date" value={m.provenDate} icon={<CheckCircle2 size={13} className="text-green-500" />} />
                      )}

                      {m.attempts.length === 0 ? (
                        <p className="text-xs text-center py-3" style={{ color: 'var(--text-faint)' }}>No attempts recorded yet</p>
                      ) : (
                        m.attempts.map((a, idx) => (
                          <div key={idx} className="rounded-xl p-3 space-y-1" style={{ background: 'var(--bg-alt)' }}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold" style={{ color: 'var(--navy)' }}>Attempt {idx + 1} — {a.date}</span>
                              <button type="button" onClick={() => deleteAttempt(m.id, idx)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover-danger"
                                aria-label="Delete attempt">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <span className="font-medium" style={{ color: 'var(--text)' }}>{a.startTemp}°C</span>
                              <span>@ {a.startTime}</span>
                              <span style={{ color: 'var(--text-faint)' }}>→</span>
                              <span className="font-medium" style={{ color: 'var(--text)' }}>{a.midTemp}°C</span>
                              <span>@ {a.midTime}</span>
                              <span style={{ color: 'var(--text-faint)' }}>→</span>
                              <span className="font-medium" style={{ color: 'var(--text)' }}>{a.endTemp}°C</span>
                              <span>@ {a.endTime}</span>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Recorder: {a.recorder}</p>
                            {a.notes && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Notes: {a.notes}</p>}
                          </div>
                        ))
                      )}

                      <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => openAddAttempt(m.id)}
                          className="flex-1 min-h-[44px] px-4 rounded-xl btn-outline flex items-center justify-center gap-2 text-sm font-medium">
                          <Plus size={14} /> Record Attempt
                        </button>
                        <button type="button" onClick={() => deleteDish(m.id)}
                          className="min-h-[44px] px-4 rounded-xl text-red-500 hover-danger flex items-center justify-center gap-2 text-sm font-medium">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Weekly Checks Tab */}
      {activeTab === 'weekly' && (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Once proven, validate each cooling method weekly to confirm it still works.
          </p>
          {checks.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center shadow-sm">
              <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No weekly checks recorded yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Tap + to record a weekly cooling check</p>
            </div>
          ) : (
            checks.map(c => (
              <div key={c.id} className="card rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between min-h-[44px] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: c.passed ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)' }}>
                        {c.passed ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{getDishName(c.dishId)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {c.date} · {c.startTemp}°C → {c.endTemp}°C · {c.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.passed ? 'badge-success' : 'badge-danger'}`}>
                      {c.passed ? 'Pass' : 'Fail'}
                    </span>
                    <button type="button" onClick={() => deleteCheck(c.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover-danger"
                      aria-label="Delete check">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {(c.recorder || c.notes) && (
                  <div className="px-4 pb-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                    {c.recorder && <DetailRow label="Recorder" value={c.recorder} />}
                    {c.notes && <DetailRow label="Notes" value={c.notes} />}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* FAB */}
      <button type="button" onClick={activeTab === 'prove' ? openAddDish : openAddCheck}
        className="fab" aria-label={activeTab === 'prove' ? 'Add dish' : 'Add weekly check'}>
        <Plus className="w-7 h-7" />
      </button>

      {/* Add Dish Sheet */}
      {showSheet && sheetMode === 'dish' && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} aria-hidden />
          <div className="sheet p-6">
            <div className="sheet-handle" />
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Add Cooling Dish</h3>
            <div className="space-y-3">
              <InputField label="Dish Name *" value={dishForm.dishName}
                onChange={v => setDishForm({ ...dishForm, dishName: v })} placeholder="e.g. Sausage Rolls" />
              <AreaField label="Cooling Method" value={dishForm.method}
                onChange={v => setDishForm({ ...dishForm, method: v })}
                placeholder="e.g. Blast chiller, shallow trays in walk-in fridge..." />
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button type="button" onClick={() => setShowSheet(false)} className="btn-outline min-h-[44px] px-4 rounded-xl text-sm">Cancel</button>
              <button type="button" onClick={saveDish} disabled={!dishForm.dishName.trim()}
                className="btn-primary min-h-[44px] px-4 rounded-xl text-sm disabled:opacity-40">Add Dish</button>
            </div>
          </div>
        </>
      )}

      {/* Record Attempt Sheet */}
      {showSheet && sheetMode === 'attempt' && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} aria-hidden />
          <div className="sheet p-6">
            <div className="sheet-handle" />
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Record Cooling Attempt</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              {methods.find(m => m.id === attemptDishId)?.dishName}
            </p>
            <div className="space-y-3">
              <InputField label="Date" value={attemptForm.date} type="date"
                onChange={v => setAttemptForm({ ...attemptForm, date: v })} />

              <div className="card rounded-xl p-3 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>
                  Checkpoint 1 — Start (≥60°C)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Temp (°C)" value={attemptForm.startTemp}
                    onChange={v => setAttemptForm({ ...attemptForm, startTemp: v })} type="number" placeholder="60" inputMode="decimal" />
                  <InputField label="Time" value={attemptForm.startTime}
                    onChange={v => setAttemptForm({ ...attemptForm, startTime: v })} type="time" />
                </div>
              </div>

              <div className="card rounded-xl p-3 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>
                  Checkpoint 2 — Mid (≤20°C within 2hr)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Temp (°C)" value={attemptForm.midTemp}
                    onChange={v => setAttemptForm({ ...attemptForm, midTemp: v })} type="number" placeholder="20" inputMode="decimal" />
                  <InputField label="Time" value={attemptForm.midTime}
                    onChange={v => setAttemptForm({ ...attemptForm, midTime: v })} type="time" />
                </div>
              </div>

              <div className="card rounded-xl p-3 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>
                  Checkpoint 3 — End (≤5°C within 4hr)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Temp (°C)" value={attemptForm.endTemp}
                    onChange={v => setAttemptForm({ ...attemptForm, endTemp: v })} type="number" placeholder="5" inputMode="decimal" />
                  <InputField label="Time" value={attemptForm.endTime}
                    onChange={v => setAttemptForm({ ...attemptForm, endTime: v })} type="time" />
                </div>
              </div>

              <InputField label="Recorder" value={attemptForm.recorder}
                onChange={v => setAttemptForm({ ...attemptForm, recorder: v })} placeholder="Name" />
              <AreaField label="Notes" value={attemptForm.notes}
                onChange={v => setAttemptForm({ ...attemptForm, notes: v })} placeholder="Optional notes..." />
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button type="button" onClick={() => setShowSheet(false)} className="btn-outline min-h-[44px] px-4 rounded-xl text-sm">Cancel</button>
              <button type="button" onClick={saveAttempt} disabled={!attemptForm.startTemp || !attemptForm.startTime}
                className="btn-primary min-h-[44px] px-4 rounded-xl text-sm disabled:opacity-40">Save Attempt</button>
            </div>
          </div>
        </>
      )}

      {/* Add Weekly Check Sheet */}
      {showSheet && sheetMode === 'check' && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} aria-hidden />
          <div className="sheet p-6">
            <div className="sheet-handle" />
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Record Weekly Check</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Dish *</label>
                <select value={checkForm.dishId} onChange={e => setCheckForm({ ...checkForm, dishId: e.target.value })}
                  title="Select dish"
                  className="glass-input w-full min-h-[44px] px-4 rounded-xl" style={{ color: 'var(--text)' }}>
                  <option value="">Select dish</option>
                  {provenMethods.length > 0 ? (
                    provenMethods.map(m => <option key={m.id} value={m.id}>{m.dishName}</option>)
                  ) : (
                    methods.map(m => <option key={m.id} value={m.id}>{m.dishName}</option>)
                  )}
                </select>
                {methods.length === 0 && (
                  <p className="text-xs mt-1 text-amber-500">Add a dish first in the Prove Method tab</p>
                )}
              </div>
              <InputField label="Date" value={checkForm.date} type="date"
                onChange={v => setCheckForm({ ...checkForm, date: v })} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Start Temp (°C)" value={checkForm.startTemp}
                  onChange={v => setCheckForm({ ...checkForm, startTemp: v })} type="number" placeholder="60" inputMode="decimal" />
                <InputField label="End Temp (°C)" value={checkForm.endTemp}
                  onChange={v => setCheckForm({ ...checkForm, endTemp: v })} type="number" placeholder="5" inputMode="decimal" />
              </div>
              <InputField label="Duration" value={checkForm.duration}
                onChange={v => setCheckForm({ ...checkForm, duration: v })} placeholder="e.g. 4h 30m" />
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Result</label>
                <div style={{ display: 'flex', gap: '0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <button type="button" onClick={() => setCheckForm({ ...checkForm, passed: true })}
                    style={{
                      flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: checkForm.passed ? 'var(--navy)' : 'var(--bg-alt)',
                      color: checkForm.passed ? 'var(--btn-primary-text)' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}>
                    Pass
                  </button>
                  <button type="button" onClick={() => setCheckForm({ ...checkForm, passed: false })}
                    style={{
                      flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: 600, border: 'none',
                      borderLeft: '1px solid var(--border)', cursor: 'pointer',
                      background: !checkForm.passed ? 'var(--navy)' : 'var(--bg-alt)',
                      color: !checkForm.passed ? 'var(--btn-primary-text)' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}>
                    Fail
                  </button>
                </div>
              </div>
              <InputField label="Recorder" value={checkForm.recorder}
                onChange={v => setCheckForm({ ...checkForm, recorder: v })} placeholder="Name" />
              <AreaField label="Notes" value={checkForm.notes}
                onChange={v => setCheckForm({ ...checkForm, notes: v })} placeholder="Optional notes..." />
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button type="button" onClick={() => setShowSheet(false)} className="btn-outline min-h-[44px] px-4 rounded-xl text-sm">Cancel</button>
              <button type="button" onClick={saveCheck} disabled={!checkForm.dishId || !checkForm.startTemp}
                className="btn-primary min-h-[44px] px-4 rounded-xl text-sm disabled:opacity-40">Save Check</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
