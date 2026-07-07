import { useState, useEffect } from 'react';
import { Moon, Sun, Info, Beaker, Store, User } from 'lucide-react';
import { loadStr, saveStr, isDemoMode, setDemoMode } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/storageKeys';
import { Card, SectionTitle } from './ui/Card';
import { Button } from './ui/Button';
import BackupStatusCard from './BackupStatusCard';

export default function SettingsHome({
  recorder,
  updateRecorder,
  dark,
  toggleTheme,
  onBackup,
  onAbout,
}: {
  recorder: string;
  updateRecorder: (v: string) => void;
  dark: boolean;
  toggleTheme: () => void;
  onBackup: () => void;
  onAbout: () => void;
}) {
  const [venue, setVenue] = useLocalState(STORAGE_KEYS.venueTitle, '');
  const [demo, setDemo] = useState(() => isDemoMode());

  const toggleDemo = (v: boolean) => { setDemo(v); setDemoMode(v); };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-10">
      <h1 className="text-xl font-semibold tracking-tight mb-1" style={{ color: 'var(--text)' }}>Settings</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Business details, data safety, and preferences.</p>

      <section className="mb-6">
        <SectionTitle className="mb-3">Business profile</SectionTitle>
        <Card size="lg">
          <div className="space-y-4">
            <div>
              <label className="kfield-label">Business name</label>
              <div className="flex items-center gap-2">
                <Store size={18} style={{ color: 'var(--text-faint)' }} />
                <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Majestic Cafe" className="kinput" />
              </div>
            </div>
            <div>
              <label className="kfield-label">Your name (recorder)</label>
              <div className="flex items-center gap-2">
                <User size={18} style={{ color: 'var(--text-faint)' }} />
                <input value={recorder} onChange={(e) => updateRecorder(e.target.value)} placeholder="Who's recording today?" className="kinput" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mb-6">
        <SectionTitle className="mb-3">Backup & restore</SectionTitle>
        <BackupStatusCard onBackup={onBackup} onRestore={onBackup} />
      </section>

      <section className="mb-6">
        <SectionTitle className="mb-3">App appearance</SectionTitle>
        <Card size="lg">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 text-left">
            <span className="record-card-icon" style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--navy)' }}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{dark ? 'Light mode' : 'Dark mode'}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Switch theme</p>
            </div>
            <span className="status-badge badge-neutral">{dark ? 'Dark' : 'Light'}</span>
          </button>
        </Card>
      </section>

      <section className="mb-6">
        <SectionTitle className="mb-3">Data & demo</SectionTitle>
        <Card size="lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="record-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--kaio-purple)' }}>
              <Beaker size={18} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Demo mode</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Show sample data (off in production)</p>
            </div>
            <Toggle on={demo} onChange={toggleDemo} />
          </div>
          <Button block variant="secondary" icon={Info} onClick={onAbout}>About Kaio</Button>
        </Card>
      </section>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className={`toggle ${on ? 'on' : ''}`} aria-pressed={on} aria-label="Toggle" />
  );
}

function useLocalState(key: string, initial: string): [string, (v: string) => void] {
  const [v, setV] = useState(() => loadStr(key, initial));
  useEffect(() => { saveStr(key, v); }, [key, v]);
  return [v, setV];
}
