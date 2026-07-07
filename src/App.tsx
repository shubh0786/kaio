import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Moon, Sun, ArrowLeft, WifiOff } from 'lucide-react';
import { loadStr, saveStr, isDemoMode } from './lib/storage';
import { STORAGE_KEYS } from './lib/storageKeys';
import { AREA_NAV, MODULES, moduleMeta, type Tab } from './lib/nav';
import { getRoute, navigateToApp, areaOfView } from './lib/route';
import ThemeTransition from './components/ThemeTransition';
import { KaioMark, KaioLogo } from './components/KaioLogo';
import { AlertBanner } from './components/ui/AlertBanner';
import SetupWizard from './components/SetupWizard';
import TodayHome from './components/TodayHome';
import TodayTasks from './components/TodayTasks';
import QuickTempCheck from './components/QuickTempCheck';
import RecordsHome from './components/RecordsHome';
import VerifyHome from './components/VerifyHome';
import SettingsHome from './components/SettingsHome';
import EmptyState from './components/EmptyState';

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

const DAILY_MODULES: Tab[] = ['temps', 'diary', 'cleaning', 'cooking', 'cooling'];
const MODULE_IDS = MODULES.map((m) => m.id);

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  );
}

function App() {
  const [view, setView] = useState<string>(() => getRoute().view || 'today');
  const [recorder, setRecorder] = useState(() => loadStr(STORAGE_KEYS.recorder));
  const [dark, setDark] = useState(() => loadStr(STORAGE_KEYS.theme) === 'dark');
  const [themeAnim, setThemeAnim] = useState(false);
  const [animTarget, setAnimTarget] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [overlay, setOverlay] = useState<null | 'proven' | 'kitchen'>(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [setupDone, setSetupDone] = useState(() => loadStr(STORAGE_KEYS.setupComplete) === '1' || isDemoMode());

  useEffect(() => {
    const onOn = () => setOnline(true);
    const onOff = () => setOnline(false);
    window.addEventListener('online', onOn);
    window.addEventListener('offline', onOff);
    return () => {
      window.removeEventListener('online', onOn);
      window.removeEventListener('offline', onOff);
    };
  }, []);

  useEffect(() => {
    const onHash = () => setView(getRoute().view || 'today');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    saveStr(STORAGE_KEYS.theme, dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = useCallback(() => {
    const next = !dark;
    setAnimTarget(next);
    setThemeAnim(true);
    setTimeout(() => setDark(next), 350);
    setTimeout(() => setThemeAnim(false), 1100);
  }, [dark]);

  const updateRecorder = (v: string) => { setRecorder(v); saveStr(STORAGE_KEYS.recorder, v); };

  const go = (v: string) => {
    setView(v);
    navigateToApp(v);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const openModule = (id: Tab) => {
    if (id === 'kitchen') { setOverlay('kitchen'); return; }
    if (id === 'proven') { setOverlay('proven'); return; }
    go(id);
  };

  const area = areaOfView(view);
  const isModule = MODULE_IDS.includes(view as Tab) && !['today', 'records', 'verify', 'settings', 'checks', 'quick-temp'].includes(view);
  const isChecks = view === 'checks';
  const isQuickTemp = view === 'quick-temp';
  const isDetail = isModule || isChecks || isQuickTemp;
  const meta = isModule ? moduleMeta(view as Tab) : undefined;
  const detailTitle = isChecks ? "Today's checks" : isQuickTemp ? 'Quick check' : meta?.label;
  const backTarget = isChecks || isQuickTemp ? 'today' : isModule && DAILY_MODULES.includes(view as Tab) ? 'today' : 'records';

  const renderArea = () => {
    switch (area) {
      case 'today':
        return <TodayHome recorder={recorder} onOpen={openModule} onChecks={() => go('checks')} onBackup={() => setShowExport(true)} />;
      case 'records':
        return <RecordsHome onOpen={openModule} />;
      case 'verify':
        return <VerifyHome />;
      case 'settings':
        return (
          <SettingsHome
            recorder={recorder}
            updateRecorder={updateRecorder}
            dark={dark}
            toggleTheme={toggleTheme}
            onBackup={() => setShowExport(true)}
            onAbout={() => setShowAbout(true)}
          />
        );
    }
  };

  const renderModule = () => {
    switch (view) {
      case 'temps': return <TempLogApp recorder={recorder} />;
      case 'diary': return <DailyDiary recorder={recorder} />;
      case 'cleaning': return <CleaningMaintenance recorder={recorder} />;
      case 'staff': return <StaffTraining recorder={recorder} venueTitle={loadStr(STORAGE_KEYS.venueTitle) || undefined} />;
      case 'suppliers': return <SuppliersDeliveries recorder={recorder} />;
      case 'allergens': return <AllergenRegister recorder={recorder} />;
      case 'cooking': return <CookingValidation recorder={recorder} />;
      case 'cooling': return <CoolingRecords recorder={recorder} />;
      case 'calibration': return <Calibration recorder={recorder} />;
      case 'complaints': return <CustomerComplaints recorder={recorder} />;
      case 'incidents': return <Incidents recorder={recorder} />;
      case 'review': return <FourWeekReview recorder={recorder} />;
      default: return <EmptyState title="Not found" description="This view doesn't exist." actionLabel="Back to Today" onAction={() => go('today')} />;
    }
  };

  if (!setupDone) {
    return <SetupWizard onComplete={() => setSetupDone(true)} />;
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed top-0 left-0 bottom-0 z-40" style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
        <div className="px-5 py-5 flex items-center gap-3">
          <KaioMark size={34} className="rounded-xl" />
          <KaioLogo dark={dark} className="h-7 w-auto" />
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {AREA_NAV.map((a) => {
            const Icon = a.icon;
            const active = area === a.id;
            return (
              <button key={a.id} onClick={() => go(a.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all"
                style={active
                  ? { background: 'var(--bg-card)', color: 'var(--text-nav-active)', fontWeight: 600, boxShadow: 'var(--shadow-card)' }
                  : { color: 'var(--text-nav)' }}>
                <Icon size={18} style={{ color: active ? 'var(--navy)' : 'var(--text-faint)' }} />
                <span className="text-[13px]">{a.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3">
          <button onClick={toggleTheme} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left" style={{ color: 'var(--text-muted)' }}>
            <span className="theme-icon inline-block">{dark ? <Sun size={16} /> : <Moon size={16} />}</span>
            <span className="text-[12px] font-medium">{dark ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        {!online && (
          <div className="px-4 pt-3">
            <AlertBanner variant="info" title="You're offline" icon={WifiOff}>
              Records still save on this device and sync when you're back online.
            </AlertBanner>
          </div>
        )}
        {/* Mobile top header */}
        <div className="sticky top-0 z-30 md:hidden" style={{ background: 'var(--bg-bar)', borderBottom: '1px solid var(--border)', paddingTop: 'max(4px, env(safe-area-inset-top))' }}>
          <div className="px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isDetail ? (
                <button onClick={() => go(backTarget)} className="p-1.5 -ml-1 rounded-lg" style={{ color: 'var(--text-muted)' }} aria-label="Back">
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <KaioMark size={28} className="rounded-lg" />
              )}
              {isDetail ? (
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{detailTitle}</span>
              ) : (
                <KaioLogo dark={dark} className="h-6 w-auto" />
              )}
            </div>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} aria-label="Toggle theme">
              <span className="theme-icon inline-block">{dark ? <Sun size={18} /> : <Moon size={18} />}</span>
            </button>
          </div>
        </div>

        {/* Desktop detail header */}
        {isDetail && detailTitle && (
          <div className="hidden md:flex items-center px-6 lg:px-8 py-4" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => go(backTarget)} className="flex items-center gap-1.5 text-sm font-medium mr-4" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{detailTitle}</h2>
          </div>
        )}

        <div className={`flex-1 ${isDetail ? 'content-area-mobile' : ''}`} style={{ background: 'var(--bg-content)' }}>
          {isChecks ? (
            <TodayTasks onOpen={openModule} onQuickTemp={() => go('quick-temp')} />
          ) : isQuickTemp ? (
            <QuickTempCheck recorder={recorder} onDone={() => go('today')} onManageUnits={() => go('temps')} />
          ) : isModule ? (
            <Suspense fallback={<TabLoader />}>
              <div className="max-w-4xl mx-auto">{renderModule()}</div>
            </Suspense>
          ) : (
            renderArea()
          )}
        </div>
      </div>

      {/* Mobile bottom bar — 4 areas */}
      <div className="bottom-bar md:hidden no-print">
        <div className="flex items-center justify-around">
          {AREA_NAV.map((a) => {
            const Icon = a.icon;
            const active = area === a.id;
            return (
              <button key={a.id} onClick={() => go(a.id)} className="bottom-bar-item" style={active ? { color: 'var(--text-nav-active)' } : {}}>
                <div className="bar-icon" style={active ? { background: 'var(--bg-hover)' } : {}}><Icon size={20} /></div>
                <span>{a.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {themeAnim && <ThemeTransition animTarget={animTarget} />}

      <Suspense fallback={null}>
        {showExport && <GlobalExport recorder={recorder} onClose={() => setShowExport(false)} />}
        {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
        {overlay === 'proven' && (
          <div className="fixed inset-0 z-[200] overflow-y-auto" style={{ background: 'var(--bg)' }}>
            <ProvenMethodsAudit onBack={() => setOverlay(null)} recorderName={recorder} />
          </div>
        )}
        {overlay === 'kitchen' && <KitchenTaskManager onClose={() => setOverlay(null)} />}
      </Suspense>
    </div>
  );
}

export default App;
