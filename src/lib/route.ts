export type KaioRoute = 'landing' | 'app';
export type Area = 'today' | 'records' | 'verify' | 'settings';

export const AREAS: Area[] = ['today', 'records', 'verify', 'settings'];

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '');

export interface ParsedRoute {
  route: KaioRoute;
  /** View path after #/app/, e.g. "" | "today" | "temps" */
  view: string;
}

/** Parse the current URL hash into a route + view. */
export function getRoute(): ParsedRoute {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts[0] !== 'app') return { route: 'landing', view: '' };
  return { route: 'app', view: parts.slice(1).join('/') };
}

/** Resolved area for a view (used for nav highlighting). */
export function areaOfView(view: string): Area {
  if (view === '' || view === 'today' || view === 'checks' || view === 'quick-temp') return 'today';
  if (view === 'records') return 'records';
  if (view === 'verify') return 'verify';
  if (view === 'settings') return 'settings';
  // every module lives under Records
  return 'records';
}

export function appUrl(view = 'today'): string {
  return `${BASE}/#/app/${view}`;
}

export function landingUrl(): string {
  return `${BASE}/`;
}

/** Navigate inside the app to a view (hash-based). */
export function navigateToApp(view = 'today'): void {
  const target = `#/app/${view}`;
  if (window.location.hash !== target) {
    window.location.hash = target;
  } else {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

export function navigateTo(route: KaioRoute, view = 'today'): void {
  if (route === 'app') {
    navigateToApp(view);
  } else {
    window.history.pushState({}, '', landingUrl());
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
