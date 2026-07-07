import { differenceInDays, parseISO, isValid } from 'date-fns';
import { loadStr } from './storage';
import { STORAGE_KEYS } from './storageKeys';

export function getLastBackupAt(): string | null {
  const v = loadStr(STORAGE_KEYS.lastBackupAt, '');
  if (!v) return null;
  const d = parseISO(v);
  return isValid(d) ? v : null;
}

export function backupStatus(): { lastAt: string | null; days: number | null; stale: boolean; never: boolean } {
  const lastAt = getLastBackupAt();
  if (!lastAt) return { lastAt: null, days: null, stale: false, never: true };
  const days = differenceInDays(new Date(), parseISO(lastAt));
  return { lastAt, days, stale: days > 7, never: false };
}
