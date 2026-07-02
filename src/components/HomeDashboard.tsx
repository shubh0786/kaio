import { useMemo } from 'react';
import {
  Thermometer, ClipboardCheck, SprayCan, Users, Truck, AlertTriangle,
  CalendarCheck, ArrowRight, CheckCircle2, Menu, Moon, Sun,
} from 'lucide-react';
import { format } from 'date-fns';
import { computeDashboardStats } from '../lib/dashboardStats';
import type { Tab } from '../lib/nav';
import { ALL_TABS } from '../lib/nav';

interface HomeDashboardProps {
  recorder: string;
  updateRecorder: (v: string) => void;
  go: (t: Tab) => void;
  dark: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (v: boolean) => void;
  refreshKey: number;
}

export default function HomeDashboard({
  recorder, updateRecorder, go, dark, toggleTheme, setSidebarOpen, refreshKey,
}: HomeDashboardProps) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const stats = useMemo(() => computeDashboardStats(today, refreshKey), [today, refreshKey]);

  const alerts: { text: string; action: Tab; color: string; icon: typeof AlertTriangle }[] = [];
  if (stats.tempUnits > 0 && stats.tempsLogged === 0) alerts.push({ text: 'No temperatures logged today', action: 'temps', color: '#f59e0b', icon: Thermometer });
  if (!stats.diaryDone) alerts.push({ text: 'Daily diary not started', action: 'diary', color: '#f59e0b', icon: ClipboardCheck });
  if (stats.reviewOverdue) alerts.push({ text: `4-week review overdue (${stats.daysSinceReview} days)`, action: 'review', color: '#ef4444', icon: CalendarCheck });
  if (stats.staffCount > 0 && stats.recentTraining === 0) alerts.push({ text: 'No recent staff training (90 days)', action: 'staff', color: '#f59e0b', icon: Users });

  const quickActions: { id: Tab; label: string; icon: typeof Thermometer; desc: string; badge?: string }[] = [
    { id: 'temps', label: 'Temperatures', icon: Thermometer, desc: `${stats.tempsLogged}/${stats.tempUnits} logged`, badge: stats.tempsLogged === stats.tempUnits && stats.tempUnits > 0 ? '✓' : undefined },
    { id: 'diary', label: 'Daily Diary', icon: ClipboardCheck, desc: stats.diaryDone ? 'Started' : 'Not started' },
    { id: 'cleaning', label: 'Cleaning', icon: SprayCan, desc: `${stats.cleaningToday} tasks today` },
    { id: 'suppliers', label: 'Deliveries', icon: Truck, desc: `${stats.deliveriesToday} today` },
  ];

  return (
    <div className="min-h-screen px-4 py-5 pb-24" style={{ background: 'var(--bg-content)', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl" style={{ color: 'var(--text-faint)' }} aria-label="Open menu"><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--navy)' }}>
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="text-sm font-bold tracking-[2px]" style={{ color: 'var(--navy)' }}>KAIO</span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl" style={{ color: 'var(--text-faint)' }} aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>
            {recorder ? `Hi, ${recorder}` : 'Welcome'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>

        {!recorder && (
          <div className="card rounded-2xl p-4 mb-4 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Who&apos;s recording today?</label>
            <input type="text" value={recorder} onChange={e => updateRecorder(e.target.value)}
              className="glass-input w-full min-h-[44px] px-4 rounded-xl text-sm font-medium" placeholder="Enter your name" autoFocus />
          </div>
        )}

        {alerts.length > 0 && (
          <div className="space-y-2 mb-4">
            {alerts.map((a) => {
              const Icon = a.icon;
              return (
                <button key={a.text} onClick={() => go(a.action)} className="w-full card rounded-2xl p-3.5 shadow-sm flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                  style={{ borderLeft: `3px solid ${a.color}` }}>
                  <Icon size={18} style={{ color: a.color }} />
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text)' }}>{a.text}</span>
                  <ArrowRight size={14} style={{ color: 'var(--text-faint)' }} />
                </button>
              );
            })}
          </div>
        )}

        {alerts.length === 0 && recorder && (
          <div className="card rounded-2xl p-4 mb-4 shadow-sm flex items-center gap-3" style={{ borderLeft: '3px solid #34d399' }}>
            <CheckCircle2 size={20} className="text-green-500" />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>All caught up!</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No outstanding tasks today</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {quickActions.map(qa => {
            const Icon = qa.icon;
            return (
              <button key={qa.id} onClick={() => go(qa.id)} className="card rounded-2xl p-4 shadow-sm text-left transition-all active:scale-[0.97] relative">
                {qa.badge && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">{qa.badge}</span>}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: 'var(--bg-alt)' }}>
                  <Icon size={18} style={{ color: 'var(--navy)' }} />
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{qa.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{qa.desc}</p>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>All Sections</p>
        <div className="space-y-2 mb-4">
          {ALL_TABS.filter(t => t.id !== 'home').map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => go(t.id)} className="w-full card rounded-xl p-3 shadow-sm flex items-center gap-3 text-left transition-all active:scale-[0.98]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--bg-alt)' }}>
                  <Icon size={16} style={{ color: 'var(--navy)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.label}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{t.desc}</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-faint)' }} />
              </button>
            );
          })}
        </div>

        <div className="text-center pt-2 pb-4">
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>Kaio v1.0 &middot; food safety, sorted.</p>
        </div>
      </div>
    </div>
  );
}
