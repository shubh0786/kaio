export type KaioRoute = 'landing' | 'app';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '');

/** Path after the Vite base, e.g. "" | "app" | "app/". */
export function relativePath(): string {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const basePath = BASE.replace(/\/$/, '') || '';
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length).replace(/^\//, '');
  }
  return pathname.replace(/^\//, '');
}

export function getRoute(): KaioRoute {
  const rel = relativePath();
  return rel === 'app' || rel.startsWith('app/') ? 'app' : 'landing';
}

export function appUrl(): string {
  return `${BASE}/app`;
}

export function landingUrl(): string {
  return `${BASE}/`;
}

export function navigateTo(route: KaioRoute): void {
  const url = route === 'app' ? appUrl() : landingUrl();
  if (window.location.pathname.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
    window.history.pushState({ route }, '', url);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}
