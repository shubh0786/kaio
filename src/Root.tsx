import { lazy, Suspense, useEffect, useState } from 'react';
import { getRoute, navigateTo, type KaioRoute } from './lib/route';
import { loadStr } from './lib/storage';
import { STORAGE_KEYS } from './lib/storageKeys';

const LandingPage = lazy(() => import('./components/LandingPage'));
const App = lazy(() => import('./App'));

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  );
}

export default function Root() {
  const [route, setRoute] = useState<KaioRoute>(() => getRoute().route);

  useEffect(() => {
    // Apply persisted theme before the app shell mounts so the landing is theme-correct.
    document.documentElement.classList.toggle('dark', loadStr(STORAGE_KEYS.theme) === 'dark');
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(getRoute().route);
    window.addEventListener('hashchange', onPop);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onPop);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const enterApp = () => {
    navigateTo('app', 'today');
    setRoute('app');
  };

  return (
    <Suspense fallback={<RouteLoader />}>
      {route === 'app' ? <App /> : <LandingPage onEnterApp={enterApp} />}
    </Suspense>
  );
}
