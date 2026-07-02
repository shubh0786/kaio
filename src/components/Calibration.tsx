import { useState, useRef } from 'react';
import { load, save } from '../lib/storage';
import {
  Thermometer, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Camera, Download, X,
} from 'lucide-react';
import { format } from 'date-fns';
import { loadPdfTools, addPdfTitle, TABLE_HEAD_STYLE } from '../lib/exportPdf';
import { STORAGE_KEYS } from '../lib/storageKeys';

interface CalibrationRecord {
  id: string;
  date: string;
  thermometerId: string;
  icePointReading: string;
  boilingPointReading: string;
  isAccurate: boolean;
  actionTaken: string;
  recorder: string;
  photoDataUrl: string;
}

const STORAGE_KEY = STORAGE_KEYS.calibrations;

const iceAccurate = (v: string) => v !== '' && Math.abs(parseFloat(v)) <= 1;
const boilAccurate = (v: string) => v !== '' && Math.abs(parseFloat(v) - 100) <= 1;
const bothAccurate = (ice: string, boil: string) =>
  ice !== '' && boil !== '' && iceAccurate(ice) && boilAccurate(boil);

export default function Calibration({ recorder }: { recorder: string }) {
  const [records, setRecords] = useState<CalibrationRecord[]>(() => load(STORAGE_KEY, []));
  const [showSheet, setShowSheet] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);

  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formThermId, setFormThermId] = useState('');
  const [formIce, setFormIce] = useState('');
  const [formBoil, setFormBoil] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formRecorder, setFormRecorder] = useState(recorder);
  const [formPhoto, setFormPhoto] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormThermId('');
    setFormIce('');
    setFormBoil('');
    setFormAction('');
    setFormRecorder(recorder);
    setFormPhoto('');
  };

  const openSheet = () => {
    resetForm();
    setShowSheet(true);
  };

  const addRecord = () => {
    if (!formThermId.trim() || formIce === '' || formBoil === '') return;
    const entry: CalibrationRecord = {
      id: crypto.randomUUID(),
      date: formDate,
      thermometerId: formThermId.trim(),
      icePointReading: formIce,
      boilingPointReading: formBoil,
      isAccurate: bothAccurate(formIce, formBoil),
      actionTaken: formAction.trim(),
      recorder: formRecorder.trim(),
      photoDataUrl: formPhoto,
    };
    const updated = [entry, ...records];
    setRecords(updated);
    save(STORAGE_KEY, updated);
    setShowSheet(false);
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    save(STORAGE_KEY, updated);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFormPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const formIsAccurate = bothAccurate(formIce, formBoil);

  const accurateCount = records.filter((r) => r.isAccurate).length;
  const accuracyRate = records.length > 0 ? Math.round((accurateCount / records.length) * 100) : 0;
  const lastDate = records.length > 0 ? records[0].date : null;

  const exportPdf = async () => {
    const { jsPDF, autoTable } = await loadPdfTools();
    const doc = new jsPDF();
    addPdfTitle(doc, 'Thermometer Calibration Records', 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [['Date', 'Thermometer', 'Ice (°C)', 'Boil (°C)', 'Accurate', 'Action Taken', 'Recorder']],
      body: records.map((r) => [
        r.date,
        r.thermometerId,
        r.icePointReading,
        r.boilingPointReading,
        r.isAccurate ? 'Yes' : 'No',
        r.actionTaken || '—',
        r.recorder,
      ]),
      margin: { left: 14 },
      styles: { fontSize: 8 },
      headStyles: TABLE_HEAD_STYLE,
    });

    doc.save(`calibration-records-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-4 content-area px-4">
      {/* PDF export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={exportPdf}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'var(--navy)',
            color: 'var(--btn-primary-text)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* Calibration procedure reference */}
      <div className="card rounded-2xl">
        <button
          onClick={() => setProcedureOpen(!procedureOpen)}
          className="w-full flex items-center justify-between p-4 min-h-[44px]"
          style={{ color: 'var(--text)' }}
        >
          <div className="flex items-center gap-2">
            <Thermometer size={18} style={{ color: 'var(--navy)' }} />
            <span className="text-sm font-semibold">Calibration Procedure</span>
          </div>
          {procedureOpen ? (
            <ChevronUp size={20} style={{ color: 'var(--text-faint)' }} />
          ) : (
            <ChevronDown size={20} style={{ color: 'var(--text-faint)' }} />
          )}
        </button>
        {procedureOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex gap-3 items-start">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)' }}
              >
                1
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Ice Point Check</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Fill a container with crushed ice and water. Place thermometer probe in centre. Expected reading: 0°C (±1°C).
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)' }}
              >
                2
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Boiling Point Check</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Place thermometer probe in boiling water. Expected reading: 100°C (±1°C).
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--gold)', color: 'var(--btn-primary-text)' }}
              >
                !
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>If Not Accurate</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Adjust the thermometer following manufacturer instructions or replace it. Record the action taken.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {records.length > 0 && (
        <div className="card rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--navy)' }}>{records.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Records</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: accuracyRate >= 80 ? '#22c55e' : '#ef4444' }}>
                {accuracyRate}%
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Accuracy Rate</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--navy)' }}>{lastDate}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last Calibration</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {records.length === 0 && (
        <div className="card rounded-2xl p-8 text-center">
          <Thermometer size={32} style={{ color: 'var(--text-faint)', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No calibration records yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            Tap + to record a thermometer calibration
          </p>
        </div>
      )}

      {/* Records list */}
      <div className="space-y-3">
        {records.map((r) => {
          const iceOk = iceAccurate(r.icePointReading);
          const boilOk = boilAccurate(r.boilingPointReading);
          return (
            <div key={r.id} className="card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{r.date}</p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={
                        r.isAccurate
                          ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a' }
                          : { background: 'rgba(239,68,68,0.12)', color: '#dc2626' }
                      }
                    >
                      {r.isAccurate ? 'Accurate' : 'Inaccurate'}
                    </span>
                  </div>
                  <p className="font-semibold mt-1" style={{ color: 'var(--text)' }}>
                    Thermometer {r.thermometerId}
                  </p>

                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ice:</span>
                      <span className="text-sm font-semibold" style={{ color: iceOk ? '#16a34a' : '#dc2626' }}>
                        {r.icePointReading}°C
                      </span>
                      {iceOk ? (
                        <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                      ) : (
                        <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Boil:</span>
                      <span className="text-sm font-semibold" style={{ color: boilOk ? '#16a34a' : '#dc2626' }}>
                        {r.boilingPointReading}°C
                      </span>
                      {boilOk ? (
                        <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                      ) : (
                        <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                      )}
                    </div>
                  </div>

                  {r.photoDataUrl && (
                    <img
                      src={r.photoDataUrl}
                      alt="Calibration photo"
                      className="mt-2 rounded-xl"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', border: '1px solid var(--border)' }}
                    />
                  )}

                  {r.actionTaken && (
                    <p className="text-xs mt-2" style={{ color: 'var(--navy)' }}>
                      Action: {r.actionTaken}
                    </p>
                  )}

                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                    Recorded by {r.recorder}
                  </p>
                </div>
                <button
                  onClick={() => deleteRecord(r.id)}
                  aria-label="Delete record"
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-red-400 hover-danger active:scale-95 transition-all shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button onClick={openSheet} className="fab" aria-label="Add calibration record">
        <Plus size={26} />
      </button>

      {/* Add calibration sheet */}
      {showSheet && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                New Calibration Record
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  aria-label="Date"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Thermometer ID</label>
                <input
                  type="text"
                  value={formThermId}
                  onChange={(e) => setFormThermId(e.target.value)}
                  placeholder="e.g. T-001"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Ice Point Reading (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formIce}
                  onChange={(e) => setFormIce(e.target.value)}
                  placeholder="Expected: 0°C"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
                {formIce !== '' && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {iceAccurate(formIce) ? (
                      <>
                        <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                        <span className="text-xs font-medium" style={{ color: '#16a34a' }}>Within tolerance (±1°C of 0°C)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                        <span className="text-xs font-medium" style={{ color: '#dc2626' }}>Outside tolerance (±1°C of 0°C)</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Boiling Point Reading (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formBoil}
                  onChange={(e) => setFormBoil(e.target.value)}
                  placeholder="Expected: 100°C"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
                {formBoil !== '' && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {boilAccurate(formBoil) ? (
                      <>
                        <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                        <span className="text-xs font-medium" style={{ color: '#16a34a' }}>Within tolerance (±1°C of 100°C)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                        <span className="text-xs font-medium" style={{ color: '#dc2626' }}>Outside tolerance (±1°C of 100°C)</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {formIce !== '' && formBoil !== '' && !formIsAccurate && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Action Taken
                  </label>
                  <textarea
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    rows={3}
                    placeholder="Describe corrective action (adjust / replace)…"
                    aria-label="Action Taken"
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-y"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Photo Evidence</label>
                {formPhoto ? (
                  <div className="relative inline-block">
                    <img
                      src={formPhoto}
                      alt="Calibration preview"
                      className="rounded-xl"
                      style={{ width: '120px', height: '120px', objectFit: 'cover', border: '1px solid var(--border)' }}
                    />
                    <button
                      onClick={() => { setFormPhoto(''); if (photoRef.current) photoRef.current.value = ''; }}
                      aria-label="Remove photo"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: '#ef4444', color: '#fff' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="btn-outline w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl text-sm"
                  >
                    <Camera size={16} /> Take / Choose Photo
                  </button>
                )}
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhoto}
                  className="hidden"
                  aria-label="Upload calibration photo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Recorded By</label>
                <input
                  type="text"
                  value={formRecorder}
                  onChange={(e) => setFormRecorder(e.target.value)}
                  aria-label="Recorded By"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSheet(false)} className="btn-outline flex-1 py-3 min-h-[44px] rounded-xl text-sm">
                  Cancel
                </button>
                <button onClick={addRecord} className="btn-primary flex-1 py-3 min-h-[44px] rounded-xl text-sm">
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
