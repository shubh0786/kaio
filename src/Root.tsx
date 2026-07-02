import { lazy, Suspense, useEffect, useState } from 'react';
import { getRoute, navigateTo, type KaioRoute } from './lib/route';

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
  const [route, setRoute] = useState<KaioRoute>(() => getRoute());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const enterApp = () => {
    navigateTo('app');
    setRoute('app');
  };

  return (
    <Suspense fallback={<RouteLoader />}>
      {route === 'app' ? <App /> : <LandingPage onEnterApp={enterApp} />}
    </Suspense>
  );
}
