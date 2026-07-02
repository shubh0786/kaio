import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { User, X, Menu, Moon, Sun } from 'lucide-react';
import { loadStr, saveStr } from './lib/storage';
import { STORAGE_KEYS } from './lib/storageKeys';
import { ALL_TABS, MOBILE_BAR, MORE_IDS, MoreHorizontal, type Tab } from './lib/nav';
import HomeDashboard from './components/HomeDashboard';
import ThemeTransition from './components/ThemeTransition';
import AuditReportHome from './components/AuditReportHome';
import type { AuditNavAction } from './lib/auditCategories';

const TempLogApp = lazy(() => import('./temp-log/TempLogApp'));
const DailyDiary = lazy(() => import('./components/DailyDiary'));
const CleaningMaintenance = lazy(() => import('./components/CleaningMaintenance'));
const StaffTraining = lazy(() => import('./components/StaffTraining'));
const SuppliersDeliveries = lazy(() => import('./components/SuppliersDeliveries'));
const AllergenRegister = lazy(() => import('./components/AllergenRegister'));
const CookingValidation = lazy(() => import('./components/CookingValidation'));
const CoolingRecords = lazy(() => import('./components/CoolingRecords'));
const Calibration = lazy(() => import('./components/Calibration'));
const CustomerComplaints = lazy(() => import('./components/CustomerComplaints'));
const Incidents = lazy(() => import('./components/Incidents'));
const FourWeekReview = lazy(() => import('./components/FourWeekReview'));
const GlobalExport = lazy(() => import('./components/GlobalExport'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ProvenMethodsAudit = lazy(() => import('./components/ProvenMethodsAudit'));
const KitchenTaskManager = lazy(() => import('./components/KitchenTaskManager'));
const MissedTasksAlerts = lazy(() => import('./components/MissedTasksAlerts'));

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [recorder, setRecorder] = useState(() => loadStr(STORAGE_KEYS.recorder));
  const [moreOpen, setMoreOpen] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => loadStr(STORAGE_KEYS.theme) === 'dark');
  const [themeAnim, setThemeAnim] = useState(false);
  const [animTarget, setAnimTarget] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [homeMode, setHomeMode] = useState<'audit' | 'operator'>(() =>
    (loadStr(STORAGE_KEYS.homeMode) as 'audit' | 'operator') || 'audit',
  );
  const [auditOverlay, setAuditOverlay] = useState<null | 'proven' | 'kitchen' | 'alerts'>(null);
  const [staffAuditView, setStaffAuditView] = useState(false);
  const [dashboardRefresh, setDashboardRefresh] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    saveStr(STORAGE_KEYS.theme, dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    saveStr(STORAGE_KEYS.homeMode, homeMode);
  }, [homeMode]);

  const toggleTheme = useCallback(() => {
    const next = !dark;
    setAnimTarget(next);
    setThemeAnim(true);
    setTimeout(() => setDark(next), 350);
    setTimeout(() => setThemeAnim(false), 1100);
  }, [dark]);

  const updateRecorder = (v: string) => { setRecorder(v); saveStr(STORAGE_KEYS.recorder, v); };

  const go = (t: Tab, opts?: { fromAuditStaff?: boolean }) => {
    setTab(t);
    setMoreOpen(false);
    setSidebarOpen(false);
    if (t === 'home') setDashboardRefresh((k) => k + 1);
    if (t !== 'staff') setStaffAuditView(false);
    else if (opts?.fromAuditStaff) setStaffAuditView(true);
    else setStaffAuditView(false);
  };

  const handleAuditNavigate = (action: AuditNavAction) => {
    if (action.type === 'tab') go(action.id as Tab, action.id === 'staff' ? { fromAuditStaff: true } : undefined);
    else if (action.type === 'proven') setAuditOverlay('proven');
    else if (action.type === 'kitchen') setAuditOverlay('kitchen');
    else if (action.type === 'alerts') setAuditOverlay('alerts');
  };

  const isMore = MORE_IDS.includes(tab);
  const cur = ALL_TABS.find(t => t.id === tab)!;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      <aside className="hidden md:flex flex-col w-60 lg:w-64 fixed top-0 left-0 bottom-0 z-40" style={{ background: 'var(--bg-sidebar)', boxShadow: '2px 0 8px rgba(0,0,0,0.04)', transition: 'background 0.3s' }}>
        <div className="px-5 py-5 flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}kaio-icon.svg`} alt="Kaio" className="w-10 h-10 rounded-full" style={{ border: '2px solid var(--gold)' }} />
          <div>
            <h1 className="text-[15px] font-medium tracking-[3px]" style={{ color: 'var(--navy)', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>KAIO</h1>
            <p className="text-[10px] tracking-wider" style={{ color: 'var(--gold)' }}>FOOD SAFETY</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ background: 'var(--sidebar-nav-bg)' }}>
          {ALL_TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => go(t.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all"
                style={active
                  ? { background: 'var(--bg-card)', color: 'var(--text-nav-active)', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
                  : { color: 'var(--text-nav)' }
                }
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-item-hover)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Icon size={16} style={{ color: active ? 'var(--navy)' : 'var(--text-faint)' }} />
                <span className="text-[13px]">{t.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--navy)' }} />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 space-y-2">
          <button onClick={() => setShowExport(true)}
            className="w-full flex items-center gap-2.5 px-1 py-1.5 rounded text-left transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <span className="inline-block w-4"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>
            <span className="text-[12px] font-medium">Backup & Export</span>
          </button>
          <button onClick={() => setShowAbout(true)}
            className="w-full flex items-center gap-2.5 px-1 py-1.5 rounded text-left transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <span className="inline-block w-4"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
            <span className="text-[12px] font-medium">About Kaio</span>
          </button>
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-1 py-1.5 rounded text-left transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <span className="theme-icon inline-block">{dark ? <Sun size={14} /> : <Moon size={14} />}</span>
            <span className="text-[12px] font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--navy)' }}>
              <User size={12} color="white" />
            </div>
            <input type="text" value={recorder} onChange={e => updateRecorder(e.target.value)}
              className="flex-1 bg-transparent text-[13px] font-medium outline-none min-w-0" style={{ color: 'var(--text)' }}
              placeholder="Your name" />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-50 md:hidden" style={{ background: 'var(--overlay)' }} onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-72 z-50 md:hidden flex flex-col" style={{ background: 'var(--bg-sidebar)', animation: 'slideRight 0.2s ease' }}>
            <div className="p-4 flex items-center justify-between" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
              <div className="flex items-center gap-3">
                <img src={`${import.meta.env.BASE_URL}kaio-icon.svg`} alt="Kaio" className="w-9 h-9 rounded-full" style={{ border: '2px solid var(--gold)' }} />
                <span className="text-[15px] font-medium tracking-[3px]" style={{ color: 'var(--navy)', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>KAIO</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2" style={{ color: 'var(--text-faint)' }} aria-label="Close menu"><X size={18} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ background: 'var(--sidebar-nav-bg)' }}>
              {ALL_TABS.map(t => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => go(t.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
                    style={active
                      ? { background: 'var(--bg-card)', color: 'var(--text-nav-active)', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
                      : { color: 'var(--text-nav)' }
                    }>
                    <Icon size={18} style={{ color: active ? 'var(--navy)' : 'var(--text-faint)' }} />
                    <span className="text-sm">{t.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 space-y-3">
              <button onClick={toggleTheme} className="flex items-center gap-2.5" style={{ color: 'var(--text-muted)' }}>
                <span className="theme-icon inline-block">{dark ? <Sun size={16} /> : <Moon size={16} />}</span>
                <span className="text-sm font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <div className="flex items-center gap-2">
                <User size={16} style={{ color: 'var(--navy)' }} />
                <input type="text" value={recorder} onChange={e => updateRecorder(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium outline-none" style={{ color: 'var(--text)' }}
                  placeholder="Your name" />
              </div>
            </div>
          </aside>
        </>
      )}

      <div className="flex-1 md:ml-60 lg:ml-64 min-h-screen flex flex-col">

        <div className={`sticky top-0 z-30 md:hidden ${tab === 'home' || (tab === 'staff' && staffAuditView) ? 'hidden' : ''}`} style={{ background: dark ? 'var(--bg-sidebar)' : '#0a5e5e', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', paddingTop: 'max(4px, env(safe-area-inset-top))' }}>
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-1 -ml-1" style={{ color: dark ? 'var(--text-muted)' : 'rgba(255,255,255,0.8)' }} aria-label="Open menu"><Menu size={20} /></button>
              <img src={`${import.meta.env.BASE_URL}kaio-icon.svg`} alt="Kaio" className="w-7 h-7 rounded-full" style={{ border: `1.5px solid ${dark ? 'var(--gold)' : '#14b8a6'}` }} />
              <span className="text-sm font-medium tracking-[2px]" style={{ color: dark ? 'var(--navy)' : 'white', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>KAIO</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-1.5 rounded" style={{ color: dark ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)' }} aria-label="Toggle theme">
                <span className="theme-icon inline-block">{dark ? <Sun size={16} /> : <Moon size={16} />}</span>
              </button>
              <button onClick={() => setNameEditing(!nameEditing)} className="flex items-center gap-1.5 rounded px-2 py-1.5"
                style={{ border: dark ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.2)' }}>
                <User size={13} style={{ color: dark ? 'var(--text-faint)' : 'rgba(255,255,255,0.6)' }} />
                <span className="text-xs font-medium truncate max-w-[60px]" style={{ color: dark ? 'var(--text-muted)' : 'rgba(255,255,255,0.9)' }}>{recorder || 'Name'}</span>
              </button>
            </div>
          </div>
          {nameEditing && (
            <div className="px-4 pb-3 flex items-center gap-2">
              <input type="text" value={recorder} onChange={e => updateRecorder(e.target.value)} autoFocus
                className="glass-input flex-1 px-3 py-2 text-sm"
                style={dark ? {} : { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                placeholder="Enter your name" />
              <button onClick={() => setNameEditing(false)} className="p-2" style={{ color: dark ? 'var(--text-faint)' : 'rgba(255,255,255,0.6)' }} aria-label="Close name editor"><X size={16} /></button>
            </div>
          )}
        </div>

        {tab !== 'home' && !(tab === 'staff' && staffAuditView) && (
          <div className="hidden md:flex items-center justify-between px-6 lg:px-8 py-5" style={{ background: 'var(--bg-card)', transition: 'background 0.3s' }}>
            <div>
              <h2 className="text-base lg:text-lg font-semibold" style={{ color: 'var(--navy)' }}>{cur.label}</h2>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{cur.desc}</p>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
              {new Date().toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        )}

        <div className={`flex-1 ${tab !== 'home' && !(tab === 'staff' && staffAuditView) ? 'content-area-mobile' : ''}`} style={{ background: tab === 'home' ? 'transparent' : 'var(--bg-content)', transition: 'background 0.3s' }}>
          <div className={tab === 'staff' && staffAuditView ? 'w-full max-w-none' : 'max-w-4xl mx-auto'}>

            {tab === 'home' && homeMode === 'audit' && (
              <div className="relative">
                <div className="absolute top-3 right-3 z-10 md:right-8 md:top-4 flex flex-wrap gap-2 justify-end max-w-[calc(100%-1rem)]">
                  <button type="button" onClick={() => setAuditOverlay('alerts')}
                    className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl border min-h-[40px] shadow-sm transition-all hover:opacity-90"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--navy)', boxShadow: 'var(--shadow-card)' }}>
                    Missed tasks
                  </button>
                  <button type="button" onClick={() => setHomeMode('operator')}
                    className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl min-h-[40px] shadow-md transition-all hover:opacity-95"
                    style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)', boxShadow: 'var(--shadow-fab)' }}>
                    Operator dashboard
                  </button>
                </div>
                <AuditReportHome
                  venueTitle={loadStr(STORAGE_KEYS.venueTitle) || undefined}
                  onNavigate={handleAuditNavigate}
                  onOpenKitchen={() => setAuditOverlay('kitchen')}
                />
              </div>
            )}

            {tab === 'home' && homeMode === 'operator' && (
              <div>
                <div className="max-w-lg mx-auto px-4 pt-3 flex justify-end">
                  <button type="button" onClick={() => setHomeMode('audit')}
                    className="text-xs font-semibold px-3 py-2 rounded-xl border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    Audit report home
                  </button>
                </div>
                <HomeDashboard
                  recorder={recorder}
                  updateRecorder={updateRecorder}
                  go={go}
                  dark={dark}
                  toggleTheme={toggleTheme}
                  setSidebarOpen={setSidebarOpen}
                  refreshKey={dashboardRefresh}
                />
              </div>
            )}

            <Suspense fallback={<TabLoader />}>
              {tab === 'temps' && <TempLogApp recorder={recorder} />}
              {tab === 'diary' && <DailyDiary recorder={recorder} />}
              {tab === 'cleaning' && <CleaningMaintenance recorder={recorder} />}
              {tab === 'staff' && (
                <StaffTraining
                  recorder={recorder}
                  auditMode={staffAuditView}
                  onLeaveAudit={() => { setStaffAuditView(false); setTab('home'); setHomeMode('audit'); }}
                />
              )}
              {tab === 'suppliers' && <SuppliersDeliveries recorder={recorder} />}
              {tab === 'allergens' && <AllergenRegister recorder={recorder} />}
              {tab === 'cooking' && <CookingValidation recorder={recorder} />}
              {tab === 'cooling' && <CoolingRecords recorder={recorder} />}
              {tab === 'calibration' && <Calibration recorder={recorder} />}
              {tab === 'complaints' && <CustomerComplaints recorder={recorder} />}
              {tab === 'incidents' && <Incidents recorder={recorder} />}
              {tab === 'review' && <FourWeekReview recorder={recorder} />}
            </Suspense>
          </div>
        </div>
      </div>

      <div className="bottom-bar md:hidden no-print">
        <div className="flex items-center justify-around">
          {MOBILE_BAR.map(id => {
            const t = ALL_TABS.find(x => x.id === id)!;
            const Icon = t.icon;
            const active = tab === id;
            return (
              <button key={id} onClick={() => go(id)} className="bottom-bar-item" style={active ? { color: 'var(--text-nav-active)' } : {}}>
                <div className="bar-icon" style={active ? { background: 'var(--bg-hover)' } : {}}><Icon size={18} /></div>
                <span>{t.short}</span>
              </button>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className="bottom-bar-item" style={isMore ? { color: 'var(--text-nav-active)' } : {}}>
            <div className="bar-icon" style={isMore ? { background: 'var(--bg-hover)' } : {}}><MoreHorizontal size={18} /></div>
            <span>More</span>
          </button>
        </div>
      </div>

      {moreOpen && (
        <>
          <div className="sheet-overlay md:hidden" onClick={() => setMoreOpen(false)} />
          <div className="sheet md:hidden">
            <div className="sheet-handle" />
            <div className="p-5 pt-2">
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase mb-3" style={{ color: 'var(--gold)' }}>More Sections</p>
              <div className="space-y-2">
                {MORE_IDS.map(id => {
                  const t = ALL_TABS.find(x => x.id === id)!;
                  const Icon = t.icon;
                  const active = tab === id;
                  return (
                    <button key={id} onClick={() => go(id)}
                      className="card w-full flex items-center gap-3.5 p-4 text-left active:scale-[0.99] transition-all"
                      style={active ? { background: 'var(--bg-hover)', borderColor: 'var(--border-check-active)' } : {}}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: active ? 'var(--bg-hover)' : 'var(--bg-alt)' }}>
                        <Icon size={18} style={{ color: active ? 'var(--navy)' : 'var(--text-faint)' }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: active ? 'var(--navy)' : 'var(--text)' }}>{t.label}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {themeAnim && <ThemeTransition animTarget={animTarget} />}

      <Suspense fallback={null}>
        {showExport && <GlobalExport recorder={recorder} onClose={() => setShowExport(false)} />}
        {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
        {auditOverlay === 'proven' && (
          <div className="fixed inset-0 z-[200] overflow-y-auto" style={{ background: '#f4f4f4' }}>
            <ProvenMethodsAudit onBack={() => setAuditOverlay(null)} recorderName={recorder} />
          </div>
        )}
        {auditOverlay === 'kitchen' && <KitchenTaskManager onClose={() => setAuditOverlay(null)} />}
        {auditOverlay === 'alerts' && <MissedTasksAlerts onClose={() => setAuditOverlay(null)} />}
      </Suspense>
    </div>
  );
}

export default App;
