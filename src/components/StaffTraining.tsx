import { useState } from 'react';
import { load, save } from '../lib/storage';
import { Plus, Trash2, Users, BookOpen, Thermometer, ChevronRight, Grid, FileDown, Check, X, Star } from 'lucide-react';
import { format } from 'date-fns';
import { loadPdfTools, addPdfTitle, TABLE_HEAD_STYLE, lastAutoTableY } from '../lib/exportPdf';
import { STORAGE_KEYS } from '../lib/storageKeys';

const TFCP_TOPICS = [
  'Temperature control (fridge/chiller)',
  'Cooking poultry & minced meat',
  'Cooling and freezing',
  'Reheating food',
  'Food allergen management',
  'Thermometer calibration',
  'Suppliers and receiving goods',
  'Cleaning and sanitising',
  'Personal hygiene',
  'Health and sickness',
  'Food storage and stock rotation',
  'Cross contamination prevention',
  'Complaint handling',
];

interface StaffMember {
  id: string;
  name: string;
  position: string;
  startDate: string;
  email: string;
  phone: string;
  isManager?: boolean;
}

interface TrainingRecord {
  id: string;
  staffId: string;
  staffName: string;
  topic: string;
  employeeSigned: string;
  supervisorSigned: string;
  date: string;
  competent: boolean;
}

interface SicknessRecord {
  id: string;
  name: string;
  symptoms: string;
  date: string;
  actionTaken: string;
}

type Tab = 'staff' | 'training' | 'sickness' | 'matrix';

const STAFF_KEY = STORAGE_KEYS.staffList;
const TRAINING_KEY = STORAGE_KEYS.trainingRecords;
const SICKNESS_KEY = STORAGE_KEYS.sicknessLog;

export default function StaffTraining({
  recorder,
  auditMode = false,
  onLeaveAudit,
  venueTitle = 'Majestic — Whangaparaoa Audit Report',
}: {
  recorder: string;
  auditMode?: boolean;
  onLeaveAudit?: () => void;
  venueTitle?: string;
}) {
  void recorder;
  const [tab, setTab] = useState<Tab>('staff');
  const [staff, setStaff] = useState<StaffMember[]>(() => load(STAFF_KEY, []));
  const [training, setTraining] = useState<TrainingRecord[]>(() => {
    const raw = load<TrainingRecord[]>(TRAINING_KEY, []);
    return raw.map((t) => ({ ...t, competent: t.competent ?? true }));
  });
  const [sickness, setSickness] = useState<SicknessRecord[]>(() => load(SICKNESS_KEY, []));
  const [showSheet, setShowSheet] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [staffForm, setStaffForm] = useState({
    name: '', position: '', startDate: format(new Date(), 'yyyy-MM-dd'), email: '', phone: '', isManager: false,
  });
  const [trainingForm, setTrainingForm] = useState({ staffId: '', topic: '', customTopic: '', employeeSigned: '', supervisorSigned: '', date: format(new Date(), 'yyyy-MM-dd'), competent: true });
  const [sicknessForm, setSicknessForm] = useState({ name: '', symptoms: '', date: format(new Date(), 'yyyy-MM-dd'), actionTaken: '' });

  const openSheet = () => {
    if (tab === 'staff') setStaffForm({ name: '', position: '', startDate: format(new Date(), 'yyyy-MM-dd'), email: '', phone: '', isManager: false });
    if (tab === 'training') setTrainingForm({ staffId: staff[0]?.id || '', topic: '', customTopic: '', employeeSigned: '', supervisorSigned: '', date: format(new Date(), 'yyyy-MM-dd'), competent: true });
    if (tab === 'sickness') setSicknessForm({ name: '', symptoms: '', date: format(new Date(), 'yyyy-MM-dd'), actionTaken: '' });
    setShowSheet(true);
  };

  const addStaff = () => {
    if (!staffForm.name.trim()) return;
    const entry: StaffMember = { id: crypto.randomUUID(), ...staffForm, isManager: staffForm.isManager || undefined };
    const updated = [entry, ...staff];
    setStaff(updated);
    save(STAFF_KEY, updated);
    setShowSheet(false);
  };

  const deleteStaff = (id: string) => {
    const updated = staff.filter((s) => s.id !== id);
    setStaff(updated);
    save(STAFF_KEY, updated);
    setDetailId(null);
  };

  const addTraining = () => {
    const resolvedTopic = trainingForm.topic === '__other__' ? trainingForm.customTopic.trim() : trainingForm.topic;
    if (!resolvedTopic) return;
    const staffMember = staff.find((s) => s.id === trainingForm.staffId);
    const entry: TrainingRecord = {
      id: crypto.randomUUID(),
      staffId: trainingForm.staffId,
      staffName: staffMember?.name || '',
      topic: resolvedTopic,
      employeeSigned: trainingForm.employeeSigned,
      supervisorSigned: trainingForm.supervisorSigned,
      date: trainingForm.date,
      competent: trainingForm.competent,
    };
    const updated = [entry, ...training];
    setTraining(updated);
    save(TRAINING_KEY, updated);
    setShowSheet(false);
  };

  const deleteTraining = (id: string) => {
    const updated = training.filter((t) => t.id !== id);
    setTraining(updated);
    save(TRAINING_KEY, updated);
  };

  const addSickness = () => {
    if (!sicknessForm.name.trim()) return;
    const entry: SicknessRecord = { id: crypto.randomUUID(), ...sicknessForm };
    const updated = [entry, ...sickness];
    setSickness(updated);
    save(SICKNESS_KEY, updated);
    setShowSheet(false);
  };

  const deleteSickness = (id: string) => {
    const updated = sickness.filter((s) => s.id !== id);
    setSickness(updated);
    save(SICKNESS_KEY, updated);
  };

  const handleSubmit = () => {
    if (tab === 'staff') addStaff();
    else if (tab === 'training') addTraining();
    else if (tab === 'sickness') addSickness();
  };

  const exportPdf = async () => {
    const { jsPDF, autoTable } = await loadPdfTools();
    const doc = new jsPDF();
    addPdfTitle(doc, 'Staff Training Records', 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);

    let yPos = 36;

    staff.forEach((s) => {
      const records = training.filter((t) => t.staffId === s.id);
      if (records.length === 0) return;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.text(`${s.name} — ${s.position}`, 14, yPos);
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [['Topic', 'Date', 'Competent', 'Employee Signed', 'Supervisor Signed']],
        body: records.map((r) => [
          r.topic,
          r.date,
          r.competent ? 'Yes' : 'No',
          r.employeeSigned || '—',
          r.supervisorSigned || '—',
        ]),
        margin: { left: 14 },
        styles: { fontSize: 8 },
        headStyles: TABLE_HEAD_STYLE,
      });

      yPos = lastAutoTableY(doc, yPos + 10) + 10;
    });

    doc.save('training-records.pdf');
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'staff', label: 'Staff', icon: <Users size={16} /> },
    { key: 'training', label: 'Training', icon: <BookOpen size={16} /> },
    { key: 'sickness', label: 'Sickness', icon: <Thermometer size={16} /> },
    { key: 'matrix', label: 'Matrix', icon: <Grid size={16} /> },
  ];

  const selectedStaff = detailId ? staff.find((s) => s.id === detailId) : null;

  const isTopicCompetent = (staffId: string, topic: string) =>
    training.some((t) => t.staffId === staffId && t.topic === topic && t.competent);

  const latestTraining = (staffId: string): TrainingRecord | null => {
    const rows = training.filter((t) => t.staffId === staffId);
    if (!rows.length) return null;
    return [...rows].sort((a, b) => b.date.localeCompare(a.date))[0];
  };

  if (auditMode) {
    return (
      <div className="audit-shell min-h-screen pb-24" style={{ color: 'var(--text-secondary)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-4" style={{ color: 'var(--text-faint)' }}>{venueTitle}</p>
          <div
            className="rounded-2xl border overflow-hidden p-4 md:p-6 shadow-lg"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={onLeaveAudit}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide shrink-0 min-h-[44px] shadow-md"
                style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)' }}
              >
                Return to main audit screen
              </button>
              <h1 className="flex-1 text-center text-lg font-bold min-w-[200px]" style={{ color: 'var(--text)' }}>Staff Training</h1>
            </div>
            <div className="overflow-x-auto -mx-1 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr style={{ background: 'var(--bg-alt)' }}>
                    <th className="text-left p-3 font-bold border-b" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Name (* = Manager)</th>
                    <th className="text-center p-3 font-bold border-b w-28" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Training Completed</th>
                    <th className="text-left p-3 font-bold border-b" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Declaration</th>
                    <th className="text-right p-3 font-bold border-b" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Verified by Manager On</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>No staff added yet. Add staff in the main Staff section.</td>
                    </tr>
                  )}
                  {staff.map((s, idx) => {
                    const lt = latestTraining(s.id);
                    const complete = !!lt?.competent;
                    const declDate = lt?.date ? format(new Date(lt.date), 'dd/MM/yyyy') : '—';
                    return (
                      <tr
                        key={s.id}
                        style={{
                          background: idx % 2 ? 'var(--bg-alt)' : 'var(--bg-card)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <td className="p-3 align-top">
                          <span className="font-semibold" style={{ color: 'var(--text)' }}>{s.name}</span>
                          {s.isManager && <Star className="inline w-4 h-4 ml-1 text-amber-500 fill-amber-400" aria-label="Manager" />}
                        </td>
                        <td className="p-3 text-center align-top">
                          {complete ? (
                            <span className="inline-flex w-8 h-8 rounded-full items-center justify-center text-white mx-auto shadow-sm" style={{ background: 'var(--navy)' }}>
                              <Check size={18} />
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-faint)' }}>—</span>
                          )}
                        </td>
                        <td className="p-3 align-top" style={{ color: 'var(--text-secondary)' }}>
                          I, {s.name}, declare that I have completed the above training on this day: {declDate}
                        </td>
                        <td className="p-3 text-right align-top" style={{ color: 'var(--text-muted)' }}>
                          {lt?.supervisorSigned
                            ? `${lt.date ? format(new Date(lt.date), 'dd/MM/yyyy') : ''} by ${lt.supervisorSigned}`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-8 text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-faint)' }}>© {new Date().getFullYear()} Kaio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 content-area px-4">
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
          <FileDown size={16} /> Export PDF
        </button>
      </div>

      <div className="card rounded-2xl p-1.5 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? 'shadow-md' : ''
            }`}
            style={tab === t.key ? { background: 'var(--navy)', color: 'var(--btn-primary-text)' } : { color: 'var(--text-muted)' }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'staff' && (
        <div className="space-y-3">
          {staff.length === 0 && (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No staff added yet</p>
            </div>
          )}
          {staff.map((s) => (
            <div
              key={s.id}
              onClick={() => setDetailId(s.id)}
              className="card rounded-2xl p-4 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{s.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.position}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Started {s.startDate}</p>
                </div>
                <ChevronRight size={20} className="shrink-0" style={{ color: 'var(--text-faint)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'training' && (
        <div className="space-y-3">
          {training.length === 0 && (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No training records yet</p>
            </div>
          )}
          {training.map((t) => (
            <div key={t.id} className="card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{t.topic}</p>
                    {t.competent ? (
                      <Check size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                    ) : (
                      <X size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t.staffName}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{t.date}</p>
                  <div className="flex gap-3 mt-2 text-xs" style={{ color: 'var(--navy)' }}>
                    <span>Employee: {t.employeeSigned || '—'}</span>
                    <span>Supervisor: {t.supervisorSigned || '—'}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTraining(t.id)}
                  aria-label="Delete record"
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-red-400 hover-danger active:scale-95 transition-all shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sickness' && (
        <div className="space-y-3">
          {sickness.length === 0 && (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No sickness records yet</p>
            </div>
          )}
          {sickness.map((s) => (
            <div key={s.id} className="card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{s.name}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{s.symptoms}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{s.date}</p>
                  {s.actionTaken && (
                    <p className="text-xs mt-1" style={{ color: 'var(--navy)' }}>Action: {s.actionTaken}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteSickness(s.id)}
                  aria-label="Delete record"
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-red-400 hover-danger active:scale-95 transition-all shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'matrix' && (
        <div className="card rounded-2xl" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: staff.length > 3 ? `${staff.length * 110 + 220}px` : undefined }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '2px solid var(--border)', color: 'var(--text)', fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1, minWidth: '200px' }}>
                  Topic
                </th>
                {staff.map((s) => (
                  <th key={s.id} style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '2px solid var(--border)', color: 'var(--text)', fontWeight: 600, minWidth: '100px' }}>
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TFCP_TOPICS.map((topic, i) => (
                <tr key={topic} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-alt)' }}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text)', position: 'sticky', left: 0, background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-alt)', zIndex: 1 }}>
                    {topic}
                  </td>
                  {staff.map((s) => (
                    <td key={s.id} style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid var(--border)' }}>
                      {isTopicCompetent(s.id, topic) ? (
                        <Check size={18} style={{ color: '#22c55e', display: 'inline' }} />
                      ) : (
                        <span style={{ color: 'var(--text-faint)' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== 'matrix' && (
        <button onClick={openSheet} className="fab" aria-label="Add new record">
          <Plus size={26} />
        </button>
      )}

      {selectedStaff && (
        <>
          <div className="sheet-overlay" onClick={() => setDetailId(null)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{selectedStaff.name}</h3>
              <div className="space-y-3">
                <DetailRow label="Position" value={selectedStaff.position} />
                <DetailRow label="Start Date" value={selectedStaff.startDate} />
                <DetailRow label="Email" value={selectedStaff.email || '—'} />
                <DetailRow label="Phone" value={selectedStaff.phone || '—'} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDetailId(null)} className="btn-outline flex-1 py-3 min-h-[44px] rounded-xl text-sm">
                  Close
                </button>
                <button
                  onClick={() => deleteStaff(selectedStaff.id)}
                  className="flex-1 py-3 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-red-500 active:scale-[0.97] transition-all"
                >
                  Delete Staff
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSheet && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {tab === 'staff' && 'Add Staff Member'}
                {tab === 'training' && 'Add Training Record'}
                {tab === 'sickness' && 'Add Sickness Record'}
              </h3>

              {tab === 'staff' && (
                <>
                  <InputField label="Name" value={staffForm.name} onChange={(v) => setStaffForm({ ...staffForm, name: v })} />
                  <InputField label="Position" value={staffForm.position} onChange={(v) => setStaffForm({ ...staffForm, position: v })} />
                  <InputField label="Start Date" type="date" value={staffForm.startDate} onChange={(v) => setStaffForm({ ...staffForm, startDate: v })} />
                  <InputField label="Email" type="email" value={staffForm.email} onChange={(v) => setStaffForm({ ...staffForm, email: v })} />
                  <InputField label="Phone" type="tel" value={staffForm.phone} onChange={(v) => setStaffForm({ ...staffForm, phone: v })} />
                  <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={staffForm.isManager}
                      onChange={(e) => setStaffForm({ ...staffForm, isManager: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--navy)]"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manager (show star on audit report)</span>
                  </label>
                </>
              )}

              {tab === 'training' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Staff Member</label>
                    <select
                      value={trainingForm.staffId}
                      onChange={(e) => setTrainingForm({ ...trainingForm, staffId: e.target.value })}
                      aria-label="Staff Member"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    >
                      {staff.length === 0 && <option value="">No staff available</option>}
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Topic</label>
                    <select
                      value={trainingForm.topic}
                      onChange={(e) => setTrainingForm({ ...trainingForm, topic: e.target.value })}
                      aria-label="Topic"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="">Select a topic…</option>
                      {TFCP_TOPICS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__other__">Other</option>
                    </select>
                  </div>
                  {trainingForm.topic === '__other__' && (
                    <InputField label="Custom Topic" value={trainingForm.customTopic} onChange={(v) => setTrainingForm({ ...trainingForm, customTopic: v })} />
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Competent</label>
                    <div style={{ display: 'flex', gap: '0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <button
                        type="button"
                        onClick={() => setTrainingForm({ ...trainingForm, competent: true })}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: trainingForm.competent ? 'var(--navy)' : 'var(--bg-alt)',
                          color: trainingForm.competent ? 'var(--btn-primary-text)' : 'var(--text-muted)',
                          transition: 'all 0.15s',
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrainingForm({ ...trainingForm, competent: false })}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          borderLeft: '1px solid var(--border)',
                          cursor: 'pointer',
                          background: !trainingForm.competent ? 'var(--navy)' : 'var(--bg-alt)',
                          color: !trainingForm.competent ? 'var(--btn-primary-text)' : 'var(--text-muted)',
                          transition: 'all 0.15s',
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                  <InputField label="Employee Signed" value={trainingForm.employeeSigned} onChange={(v) => setTrainingForm({ ...trainingForm, employeeSigned: v })} />
                  <InputField label="Supervisor Signed" value={trainingForm.supervisorSigned} onChange={(v) => setTrainingForm({ ...trainingForm, supervisorSigned: v })} />
                  <InputField label="Date" type="date" value={trainingForm.date} onChange={(v) => setTrainingForm({ ...trainingForm, date: v })} />
                </>
              )}

              {tab === 'sickness' && (
                <>
                  <InputField label="Name" value={sicknessForm.name} onChange={(v) => setSicknessForm({ ...sicknessForm, name: v })} />
                  <InputField label="Symptoms" value={sicknessForm.symptoms} onChange={(v) => setSicknessForm({ ...sicknessForm, symptoms: v })} />
                  <InputField label="Date" type="date" value={sicknessForm.date} onChange={(v) => setSicknessForm({ ...sicknessForm, date: v })} />
                  <InputField label="Action Taken" value={sicknessForm.actionTaken} onChange={(v) => setSicknessForm({ ...sicknessForm, actionTaken: v })} />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSheet(false)} className="btn-outline flex-1 py-3 min-h-[44px] rounded-xl text-sm">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1 py-3 min-h-[44px] rounded-xl text-sm">
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

function InputField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="glass-input w-full px-4 py-3 rounded-xl text-sm"
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-sm font-medium truncate min-w-0" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
