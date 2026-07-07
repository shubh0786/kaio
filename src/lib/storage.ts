export function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

export function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadStr(key: string, fallback = ''): string {
  return localStorage.getItem(key) || fallback;
}

export function saveStr(key: string, val: string) {
  localStorage.setItem(key, val);
}

/** Demo mode gates all seed/sample data. Off in production. */
export function isDemoMode(): boolean {
  return loadStr('kaio-demo-mode') === '1';
}

export function setDemoMode(on: boolean) {
  saveStr('kaio-demo-mode', on ? '1' : '0');
}
