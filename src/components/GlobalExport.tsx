import { useState, useRef } from 'react';
import { Download, Upload, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { isKaioStorageKey } from '../lib/storageKeys';
import { saveStr } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/storageKeys';

export default function GlobalExport({ recorder, onClose }: { recorder: string; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const gatherBackupData = (): Record<string, unknown> => {
    const backup: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isKaioStorageKey(key)) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key)!);
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    return backup;
  };

  const downloadBackup = () => {
    const data = gatherBackupData();
    const meta = {
      _backup: {
        app: 'Kaio',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: recorder || 'Unknown',
        keyCount: Object.keys(data).length,
      },
      ...data,
    };
    const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaio-full-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    saveStr(STORAGE_KEYS.lastBackupAt, new Date().toISOString());
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const data = JSON.parse(raw);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid format');

        let restored = 0;
        for (const [key, value] of Object.entries(data)) {
          if (key === '_backup') continue;
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          restored++;
        }

        setStatus('success');
        setStatusMsg(`Restored ${restored} record${restored !== 1 ? 's' : ''} successfully.`);
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setStatus('error');
        setStatusMsg('Invalid backup file. Please select a valid Kaio backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 no-print"
      style={{ background: 'var(--overlay)', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}>
      <div className="rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 rounded-full mx-auto mb-4 md:hidden" style={{ background: 'var(--sheet-handle)' }} />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
            <Download size={18} className="inline mr-2" />Global Backup
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ color: 'var(--text-faint)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Export or restore all your Kaio data — temperatures, diary, cleaning, staff, and everything else — in a single file.
        </p>

        <div className="space-y-3 mb-5">
          <button onClick={downloadBackup}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] py-3 rounded-xl font-bold text-sm btn-primary">
            <Download size={16} /> Download Full Backup (JSON)
          </button>

          <button onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] py-3 rounded-xl font-bold text-sm btn-outline">
            <Upload size={16} /> Restore from Backup
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleRestore} className="hidden" aria-label="Select backup file" />
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
            <CheckCircle2 size={18} className="text-green-500 shrink-0" />
            <p className="text-sm font-semibold text-green-600">{statusMsg}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm font-semibold text-red-500">{statusMsg}</p>
          </div>
        )}

        <div className="card rounded-xl p-3 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>What's included</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Temperature logs, daily diary, cleaning records, staff & training, suppliers & deliveries, complaints, incidents, 4-week reviews, and all settings.
          </p>
        </div>

        <p className="text-xs text-center mb-4" style={{ color: 'var(--text-faint)' }}>
          Restoring a backup will overwrite your current data and reload the app.
        </p>

        <button onClick={onClose} className="w-full min-h-[44px] px-4 text-sm font-semibold rounded-xl" style={{ color: 'var(--text-muted)' }}>
          Close
        </button>
      </div>
    </div>
  );
}
