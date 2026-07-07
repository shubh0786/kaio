import { format } from 'date-fns';
import { load, save } from './storage';
import { STORAGE_KEYS } from './storageKeys';

export interface CorrectiveAction {
  id: string;
  module: string;       // 'temps' | 'deliveries' | 'cooking' | ...
  refId: string;        // e.g. `${unitId}-${date}`
  date: string;         // yyyy-MM-dd
  whatHappened: string;
  actionTaken: string;
  foodAtRisk: boolean;
  foodDiscarded: boolean;
  handledBy: string;
  followUpNeeded: boolean;
  createdAt: string;    // ISO
}

export function listCorrectiveActions(): CorrectiveAction[] {
  return load<CorrectiveAction[]>(STORAGE_KEYS.correctiveActions, []);
}

export function saveCorrectiveAction(a: Omit<CorrectiveAction, 'id' | 'createdAt'>): CorrectiveAction {
  const all = listCorrectiveActions();
  const rec: CorrectiveAction = { ...a, id: `ca-${Date.now()}`, createdAt: new Date().toISOString() };
  save(STORAGE_KEYS.correctiveActions, [rec, ...all]);
  return rec;
}

export function correctiveSummary(refId?: string): string {
  const all = listCorrectiveActions();
  const items = refId ? all.filter((a) => a.refId === refId) : all;
  if (!items.length) return '';
  const a = items[0];
  return `What happened: ${a.whatHappened}. Action: ${a.actionTaken}. Food discarded: ${a.foodDiscarded ? 'yes' : 'no'}. Handled by: ${a.handledBy}. Follow-up: ${a.followUpNeeded ? 'yes' : 'no'}.`;
}

export function todayComplianceDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
