import { useState, useCallback } from 'react';
import { load, save } from '../lib/storage';
import { Plus, ChevronDown, ChevronUp, Flame, CalendarDays, Trash2, CheckCircle2, Thermometer, Clock, User, FileText, StickyNote, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { loadPdfTools, addPdfTitle, TABLE_HEAD_STYLE, lastAutoTableY } from '../lib/exportPdf';
import { STORAGE_KEYS } from '../lib/storageKeys';

interface CookingAttempt {
  date: string;
  finalTemp: string;
  timeMinutes: string;
  recorder: string;
  notes: string;
  isProvingRecord?: boolean;
  holdKey?: '30s' | '1m' | '2m';
}
interface CookingMethod { id: string; dishName: string; method: string; attempts: CookingAttempt[]; provenDate: string; }
interface WeeklyCookingCheck { id: string; dishId: string; date: string; temperature: string; recorder: string; notes: string; }

const METHODS_KEY = STORAGE_KEYS.cookingMethods;
const CHECKS_KEY = STORAGE_KEYS.weeklyCookingChecks;

function emptyMethod(): CookingMethod {
  return { id: '', dishName: '', method: '', attempts: [], provenDate: '' };
}

function emptyAttempt(recorder: string): CookingAttempt {
  return {
    date: format(new Date(), 'yyyy-MM-dd'),
    finalTemp: '',
    timeMinutes: '',
    recorder,
    notes: '',
    isProvingRecord: true,
    holdKey: '30s',
  };
}

function emptyCheck(recorder: string): WeeklyCookingCheck {
  return { id: '', dishId: '', date: format(new Date(), 'yyyy-MM-dd'), temperature: '', recorder, notes: '' };
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', inputMode }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel';
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode}
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

function ProgressDots({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className="w-2.5 h-2.5 rounded-full transition-colors"
          style={{ background: i < count ? 'var(--navy)' : 'var(--border)' }} />
      ))}
      <span className="text-xs font-medium ml-1" style={{ color: 'var(--text-muted)' }}>{count}/{max}</span>
    </div>
  );
}

export default function CookingValidation({ recorder }: { recorder: string }) {
  const [methods, setMethods] = useState<CookingMethod[]>(() => load(METHODS_KEY, []));
  const [checks, setChecks] = useState<WeeklyCookingCheck[]>(() => load(CHECKS_KEY, []));
  const [activeTab, setActiveTab] = useState<'prove' | 'weekly'>('prove');
  const [showSheet, setShowSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState<'addDish' | 'addAttempt' | 'addCheck'>('addDish');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [methodForm, setMethodForm] = useState<CookingMethod>(emptyMethod());
  const [attemptForm, setAttemptForm] = useState<CookingAttempt>(emptyAttempt(recorder));
  const [attemptTargetId, setAttemptTargetId] = useState('');
  const [checkForm, setCheckForm] = useState<WeeklyCookingCheck>(emptyCheck(recorder));

  const persistMethods = useCallback((m: CookingMethod[]) => { setMethods(m); save(METHODS_KEY, m); }, []);
  const persistChecks = useCallback((c: WeeklyCookingCheck[]) => { setChecks(c); save(CHECKS_KEY, c); }, []);

  const isProven = (m: CookingMethod) => m.attempts.length >= 3;

  const openAddDish = () => { setMethodForm(emptyMethod()); setSheetMode('addDish'); setShowSheet(true); };
  const openAddAttempt = (id: string) => { setAttemptTargetId(id); setAttemptForm(emptyAttempt(recorder)); setSheetMode('addAttempt'); setShowSheet(true); };
  const openAddCheck = () => { setCheckForm(emptyCheck(recorder)); setSheetMode('addCheck'); setShowSheet(true); };

  const saveDish = () => {
    if (!methodForm.dishName.trim()) return;
    persistMethods([...methods, { ...methodForm, id: crypto.randomUUID() }]);
    setShowSheet(false);
  };

  const saveAttempt = () => {
    if (!attemptForm.finalTemp.trim() || !attemptForm.holdKey) return;
    const holdMinutes =
      attemptForm.holdKey === '30s' ? '0.5' : attemptForm.holdKey === '1m' ? '1' : '2';
    const payload: CookingAttempt = { ...attemptForm, timeMinutes: holdMinutes };
    const updated = methods.map(m => {
      if (m.id !== attemptTargetId) return m;
      const newAttempts = [...m.attempts, payload];
      const provenDate = newAttempts.length >= 3 && !m.provenDate ? format(new Date(), 'yyyy-MM-dd') : m.provenDate;
      return { ...m, attempts: newAttempts, provenDate };
    });
    persistMethods(updated);
    setShowSheet(false);
  };

  const deleteMethod = (id: string) => {
    if (!confirm('Delete this cooking method and all its attempts?')) return;
    persistMethods(methods.filter(m => m.id !== id));
    persistChecks(checks.filter(c => c.dishId !== id));
  };

  const saveCheck = () => {
    if (!checkForm.dishId || !checkForm.temperature.trim()) return;
    persistChecks([{ ...checkForm, id: crypto.randomUUID(), recorder }, ...checks]);
    setShowSheet(false);
  };

  const deleteCheck = (id: string) => {
    if (!confirm('Delete this weekly check?')) return;
    persistChecks(checks.filter(c => c.id !== id));
  };

  const getDishName = (id: string) => methods.find(m => m.id === id)?.dishName || 'Unknown';
  const provenMethods = methods.filter(isProven);

  const exportPDF = async () => {
    const { jsPDF, autoTable } = await loadPdfTools();
    const doc = new jsPDF();
    addPdfTitle(doc, 'Cooking Process Validation (CAR 4)');

    autoTable(doc, {
      startY: 34,
      head: [['Dish', 'Method', 'Attempts', 'Proven Date']],
      body: methods.map(m => [
        m.dishName,
        m.method || '—',
        `${m.attempts.length}/3`,
        m.provenDate ? format(new Date(m.provenDate), 'dd MMM yyyy') : 'Not yet',
      ]),
      styles: { fontSize: 8 },
      headStyles: TABLE_HEAD_STYLE,
    });

    const methodsTableEnd = lastAutoTableY(doc, 60);

    if (methods.some(m => m.attempts.length > 0)) {
      doc.setFontSize(12);
      doc.text('Proving Attempts', 14, methodsTableEnd + 10);

      const attemptRows: string[][] = [];
      methods.forEach(m => {
        m.attempts.forEach((a, i) => {
          attemptRows.push([m.dishName, `#${i + 1}`, a.date ? format(new Date(a.date), 'dd MMM yyyy') : '—', `${a.finalTemp}°C`, `${a.timeMinutes} min`, a.recorder, a.notes || '—']);
        });
      });

      autoTable(doc, {
        startY: methodsTableEnd + 14,
        head: [['Dish', 'Attempt', 'Date', 'Final Temp', 'Time', 'Recorder', 'Notes']],
        body: attemptRows,
        styles: { fontSize: 7 },
        headStyles: TABLE_HEAD_STYLE,
      });
    }

    if (checks.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text('Weekly Validation Checks', 14, 20);

      autoTable(doc, {
        startY: 26,
        head: [['Dish', 'Date', 'Temperature', 'Recorder', 'Notes']],
        body: checks.map(c => [
          getDishName(c.dishId),
          c.date ? format(new Date(c.date), 'dd MMM yyyy') : '—',
          `${c.temperature}°C`,
          c.recorder,
          c.notes || '—',
        ]),
        styles: { fontSize: 8 },
        headStyles: TABLE_HEAD_STYLE,
      });
    }

    doc.save(`cooking-validation-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-4 content-area px-4 p-4 pb-24 min-h-screen" style={{ background: 'var(--bg-alt)' }}>
      <div className="section-header flex items-center gap-2">
        <Flame className="w-5 h-5" style={{ color: 'var(--navy)' }} />
        Cooking Validation
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => setActiveTab('prove')}
          className="flex-1 min-h-[44px] px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
          style={activeTab === 'prove' ? { background: 'var(--navy)', color: 'var(--btn-primary-text)' } : { color: 'var(--text-muted)' }}>
          <Flame size={16} /> Prove Method
        </button>
        <button type="button" onClick={() => setActiveTab('weekly')}
          className="flex-1 min-h-[44px] px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
          style={activeTab === 'weekly' ? { background: 'var(--navy)', color: 'var(--btn-primary-text)' } : { color: 'var(--text-muted)' }}>
          <CalendarDays size={16} /> Weekly Checks
        </button>
      </div>

      {activeTab === 'prove' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Prove each cooking method works with 3 successful attempts, then validate weekly.
            </p>
            {methods.length > 0 && (
              <button type="button" onClick={exportPDF}
                className="btn-outline min-h-[36px] px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0"
                title="Export cooking validation as PDF">
                <FileText size={14} /> Export PDF
              </button>
            )}
          </div>
          {methods.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center shadow-sm" style={{ color: 'var(--text)' }}>
              <Flame size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No cooking methods added yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Tap + to add a dish to validate</p>
            </div>
          ) : (
            methods.map(m => {
              const proven = isProven(m);
              const isExpanded = expandedId === m.id;
              return (
                <div key={m.id} className="card rounded-2xl overflow-hidden shadow-sm">
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: proven ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)' }}>
                          {proven ? <CheckCircle2 size={16} className="text-green-500" /> : <Flame size={16} className="text-amber-500" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{m.dishName}</p>
                            {proven && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full badge-success shrink-0">PROVEN</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {m.method && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.method}</p>}
                            <ProgressDots count={Math.min(m.attempts.length, 3)} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-faint)' }} />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <DetailRow label="Method" value={m.method} icon={<FileText size={13} />} />
                      {m.provenDate && <DetailRow label="Proven Date" value={format(new Date(m.provenDate), 'dd MMM yyyy')} icon={<CheckCircle2 size={13} className="text-green-500" />} />}

                      {m.attempts.length > 0 && (
                        <div className="space-y-2 mt-2">
                          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>Attempts</p>
                          {m.attempts.map((a, i) => (
                            <div key={i} className="rounded-xl p-3 space-y-1" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold" style={{ color: 'var(--navy)' }}>Attempt #{i + 1}</span>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.date ? format(new Date(a.date), 'dd MMM yyyy') : '—'}</span>
                              </div>
                              <DetailRow label="Final Temp" value={`${a.finalTemp}°C`} icon={<Thermometer size={13} />} />
                              <DetailRow
                                label="Core held for"
                                value={
                                  a.holdKey === '1m'
                                    ? '1 minute'
                                    : a.holdKey === '2m'
                                      ? '2 minutes'
                                      : a.holdKey === '30s'
                                        ? '30 seconds'
                                        : `${a.timeMinutes} min`
                                }
                                icon={<Clock size={13} />}
                              />
                              {a.isProvingRecord !== false && (
                                <DetailRow label="Proving record" value="Yes" icon={<FileText size={13} />} />
                              )}
                              <DetailRow label="Recorder" value={a.recorder} icon={<User size={13} />} />
                              {a.notes && <DetailRow label="Notes" value={a.notes} icon={<StickyNote size={13} />} />}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => openAddAttempt(m.id)}
                          className="flex-1 min-h-[44px] px-4 rounded-xl btn-outline flex items-center justify-center gap-2 text-sm font-medium">
                          <Thermometer size={14} /> Record Attempt
                        </button>
                        <button type="button" onClick={() => deleteMethod(m.id)}
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

      {activeTab === 'weekly' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Once a cooking method is proven, validate it weekly to ensure continued compliance.
            </p>
            {checks.length > 0 && (
              <button type="button" onClick={exportPDF}
                className="btn-outline min-h-[36px] px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0"
                title="Export cooking validation as PDF">
                <FileText size={14} /> Export PDF
              </button>
            )}
          </div>
          {checks.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center shadow-sm" style={{ color: 'var(--text)' }}>
              <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No weekly checks recorded yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Tap + to record a weekly validation check</p>
            </div>
          ) : (
            checks.map(c => {
              const isExpanded = expandedId === c.id;
              return (
                <div key={c.id} className="card rounded-2xl overflow-hidden shadow-sm">
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(52,211,153,0.15)' }}>
                          <Thermometer size={16} className="text-green-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{getDishName(c.dishId)}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {c.date ? format(new Date(c.date), 'EEE dd MMM yyyy') : '—'}
                            <span> · {c.temperature}°C</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-faint)' }} />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                      <DetailRow label="Dish" value={getDishName(c.dishId)} icon={<Flame size={13} />} />
                      <DetailRow label="Temperature" value={`${c.temperature}°C`} icon={<Thermometer size={13} />} />
                      <DetailRow label="Recorder" value={c.recorder} icon={<User size={13} />} />
                      {c.notes && <DetailRow label="Notes" value={c.notes} icon={<StickyNote size={13} />} />}
                      <div className="flex justify-end mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => deleteCheck(c.id)}
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

      <button type="button" onClick={activeTab === 'prove' ? openAddDish : openAddCheck}
        className="fab" aria-label={activeTab === 'prove' ? 'Add cooking method' : 'Add weekly check'}>
        <Plus className="w-7 h-7" />
      </button>

      {showSheet && sheetMode === 'addDish' && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} aria-hidden />
          <div className="sheet p-6">
            <div className="sheet-handle" />
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Add Cooking Method</h3>
            <div className="space-y-3">
              <InputField label="Dish Name *" value={methodForm.dishName} onChange={v => setMethodForm({ ...methodForm, dishName: v })} placeholder="e.g. Sausage Rolls, Sausages" />
              <AreaField label="Cooking Method" value={methodForm.method} onChange={v => setMethodForm({ ...methodForm, method: v })} placeholder="e.g. Bake at 180°C for 25 min, internal temp ≥75°C" />
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button type="button" onClick={() => setShowSheet(false)} className="btn-outline min-h-[44px] px-4 rounded-xl text-sm">Cancel</button>
              <button type="button" onClick={saveDish} disabled={!methodForm.dishName.trim()}
                className="btn-primary min-h-[44px] px-4 rounded-xl text-sm disabled:opacity-40">Add Dish</button>
            </div>
          </div>
        </>
      )}

      {showSheet && sheetMode === 'addAttempt' && (() => {
        const targetMethod = methods.find(m => m.id === attemptTargetId);
        const attemptNum = targetMethod ? targetMethod.attempts.length + 1 : 1;
        const provingLabel = `${attemptNum} of 3 Proving Records Completed`;
        const tempChoices = Array.from({ length: 21 }, (_, i) => String(65 + i));
        const canDone = Boolean(attemptForm.finalTemp.trim() && attemptForm.holdKey);
        return (
          <>
            <div className="sheet-overlay" onClick={() => setShowSheet(false)} aria-hidden />
            <div className="sheet p-0 flex flex-col max-h-[min(92vh,800px)] overflow-hidden">
              <div className="sheet-handle shrink-0" />
              <div className="px-5 pt-2 pb-3 flex items-start gap-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold leading-tight" style={{ color: 'var(--text)' }}>
                    {targetMethod?.dishName || 'Dish'} – {provingLabel}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      <AlertTriangle size={12} /> Requires proving
                    </span>
                  </div>
                </div>
                <button type="button" onClick={() => setShowSheet(false)} className="p-2 rounded-lg shrink-0" style={{ color: 'var(--text-faint)' }} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {targetMethod?.method?.trim()
                    || 'Bake or cook until golden and fully cooked. Check the internal temperature in the centre/thickest part using a calibrated probe thermometer. The internal temperature must reach at least 75°C. If the temperature is below 75°C, continue cooking and recheck before serving or display.'}
                </p>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Is this a proving record?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAttemptForm({ ...attemptForm, isProvingRecord: true })}
                      className="min-h-[44px] px-5 rounded-xl text-sm font-semibold border-2 transition-all"
                      style={
                        attemptForm.isProvingRecord !== false
                          ? { borderColor: '#2563eb', color: '#2563eb', background: 'rgba(37,99,235,0.08)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                      }
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttemptForm({ ...attemptForm, isProvingRecord: false })}
                      className="min-h-[44px] px-5 rounded-xl text-sm font-semibold border-2 transition-all"
                      style={
                        attemptForm.isProvingRecord === false
                          ? { borderColor: '#2563eb', color: '#2563eb', background: 'rgba(37,99,235,0.08)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                      }
                    >
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Temperature</p>
                  <div className="flex items-stretch gap-2">
                    <div
                      className="flex-1 overflow-x-auto flex gap-1.5 pb-2 snap-x snap-mandatory rounded-xl px-1"
                      style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}
                    >
                      {tempChoices.map((t) => {
                        const active = attemptForm.finalTemp === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAttemptForm({ ...attemptForm, finalTemp: t })}
                            className="snap-center shrink-0 min-w-[44px] min-h-[44px] rounded-lg text-sm font-semibold transition-all"
                            style={
                              active
                                ? { background: 'var(--navy)', color: 'var(--btn-primary-text)' }
                                : { color: 'var(--text-muted)', background: 'var(--bg-card)' }
                            }
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1 min-w-[72px] rounded-xl px-2 border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={attemptForm.finalTemp}
                        onChange={(e) => setAttemptForm({ ...attemptForm, finalTemp: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold outline-none min-w-0 py-2"
                        style={{ color: 'var(--text)' }}
                        placeholder="—"
                      />
                      <span className="text-xs opacity-50">°C</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    Enter the time the core temperature held for
                  </p>
                  <div className="space-y-2">
                    {([
                      { key: '30s' as const, label: '30 secs' },
                      { key: '1m' as const, label: '1 min' },
                      { key: '2m' as const, label: '2 mins' },
                    ]).map((o) => (
                      <label key={o.key} className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                        <input
                          type="radio"
                          name="holdKey"
                          checked={attemptForm.holdKey === o.key}
                          onChange={() => setAttemptForm({ ...attemptForm, holdKey: o.key })}
                          className="w-4 h-4 accent-[#2563eb]"
                        />
                        <span className="text-sm" style={{ color: 'var(--text)' }}>{o.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <InputField label="Date" value={attemptForm.date} onChange={v => setAttemptForm({ ...attemptForm, date: v })} type="date" />
                <InputField label="Recorded By" value={attemptForm.recorder} onChange={v => setAttemptForm({ ...attemptForm, recorder: v })} placeholder="Name" />
                <AreaField label="Notes (optional)" value={attemptForm.notes} onChange={v => setAttemptForm({ ...attemptForm, notes: v })} placeholder="Any observations..." />
              </div>
              <div className="px-5 py-4 border-t flex justify-end shrink-0" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={saveAttempt}
                  disabled={!canDone}
                  className="min-h-[48px] px-8 rounded-xl text-sm font-bold disabled:opacity-40"
                  style={
                    canDone
                      ? { background: 'var(--navy)', color: 'var(--btn-primary-text)' }
                      : { background: 'var(--border)', color: 'var(--text-faint)' }
                  }
                >
                  Done
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {showSheet && sheetMode === 'addCheck' && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} aria-hidden />
          <div className="sheet p-6">
            <div className="sheet-handle" />
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Record Weekly Check</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Dish (proven methods only) *</label>
                <select value={checkForm.dishId} onChange={e => setCheckForm({ ...checkForm, dishId: e.target.value })}
                  title="Select dish"
                  className="glass-input w-full min-h-[44px] px-4 rounded-xl" style={{ color: 'var(--text)' }}>
                  <option value="">Select dish</option>
                  {provenMethods.map(m => <option key={m.id} value={m.id}>{m.dishName}</option>)}
                </select>
                {provenMethods.length === 0 && (
                  <p className="text-xs mt-1 text-amber-500">Prove a cooking method first (3 successful attempts)</p>
                )}
              </div>
              <InputField label="Date" value={checkForm.date} onChange={v => setCheckForm({ ...checkForm, date: v })} type="date" />
              <InputField label="Internal Temperature (°C) *" value={checkForm.temperature} onChange={v => setCheckForm({ ...checkForm, temperature: v })} type="number" placeholder="e.g. 75" inputMode="decimal" />
              <InputField label="Recorded By" value={checkForm.recorder} onChange={v => setCheckForm({ ...checkForm, recorder: v })} placeholder="Name" />
              <AreaField label="Notes" value={checkForm.notes} onChange={v => setCheckForm({ ...checkForm, notes: v })} placeholder="Any observations..." />
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button type="button" onClick={() => setShowSheet(false)} className="btn-outline min-h-[44px] px-4 rounded-xl text-sm">Cancel</button>
              <button type="button" onClick={saveCheck} disabled={!checkForm.dishId || !checkForm.temperature.trim()}
                className="btn-primary min-h-[44px] px-4 rounded-xl text-sm disabled:opacity-40">Save Check</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
