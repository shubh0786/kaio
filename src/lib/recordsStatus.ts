import { differenceInDays, format } from 'date-fns';
import { load } from './storage';
import { STORAGE_KEYS } from './storageKeys';
import type { BadgeStatus } from '../components/StatusBadge';
import type { Unit, TemperatureRecord } from '../temp-log/types';
import type { DiaryEntry } from '../components/DailyDiary';
import type { Tab } from './nav';

export interface RecordStatus {
  lastUpdated?: string;
  status?: BadgeStatus;
}

function latestDate(dates: (string | undefined)[]): string | undefined {
  const valid = dates.filter(Boolean) as string[];
  if (!valid.length) return undefined;
  return valid.sort().reverse()[0];
}

export function getRecordStatus(id: Tab, today = format(new Date(), 'yyyy-MM-dd')): RecordStatus {
  switch (id) {
    case 'temps': {
      const units = load<Unit[]>(STORAGE_KEYS.tempUnits, []);
      const records = load<TemperatureRecord[]>(STORAGE_KEYS.tempRecords, []);
      const lastUpdated = latestDate(records.map((r) => r.date));
      if (!units.length) return { lastUpdated };
      const logged = units.filter((u) =>
        records.some((r) => r.unitId === u.id && r.date === today && r.temperature),
      ).length;
      return { lastUpdated, status: logged === units.length ? 'completed' : 'due' };
    }
    case 'diary': {
      const diary = load<Record<string, DiaryEntry>>(STORAGE_KEYS.diaryChecks, {});
      const dates = Object.keys(diary);
      const lastUpdated = latestDate(dates);
      const t = diary[today];
      const done = t ? (t.openingChecks?.some(Boolean) || t.closingChecks?.some(Boolean)) : false;
      return { lastUpdated, status: done ? 'completed' : 'due' };
    }
    case 'cleaning': {
      const log = load<{ date: string }[]>(STORAGE_KEYS.cleaningLog, []);
      const lastUpdated = latestDate(log.map((c) => c.date));
      const todayCount = log.filter((c) => c.date === today).length;
      return { lastUpdated, status: todayCount > 0 ? 'completed' : 'due' };
    }
    case 'cooking': {
      const checks = load<{ date: string }[]>(STORAGE_KEYS.weeklyCookingChecks, []);
      const methods = load<{ attempts?: { date: string }[] }[]>(STORAGE_KEYS.cookingMethods, []);
      const lastUpdated = latestDate([
        ...checks.map((c) => c.date),
        ...methods.flatMap((m) => m.attempts?.map((a) => a.date) ?? []),
      ]);
      if (!methods.length) return { lastUpdated };
      return { lastUpdated, status: checks.some((c) => c.date === today) ? 'completed' : 'due' };
    }
    case 'cooling': {
      const checks = load<{ date: string }[]>(STORAGE_KEYS.weeklyCoolingChecks, []);
      const methods = load<{ attempts?: { date: string }[] }[]>(STORAGE_KEYS.coolingMethods, []);
      const lastUpdated = latestDate([
        ...checks.map((c) => c.date),
        ...methods.flatMap((m) => m.attempts?.map((a) => a.date) ?? []),
      ]);
      if (!methods.length) return { lastUpdated };
      return { lastUpdated, status: checks.some((c) => c.date === today) ? 'completed' : 'due' };
    }
    case 'review': {
      const reviews = load<{ periodEnd?: string; date?: string }[]>(STORAGE_KEYS.reviews, []);
      const lastUpdated = latestDate(reviews.map((r) => r.periodEnd || r.date));
      if (!reviews.length) return { lastUpdated };
      const last = reviews[reviews.length - 1];
      const days = differenceInDays(new Date(), new Date(last.periodEnd || last.date || today));
      return { lastUpdated, status: days > 28 ? 'overdue' : 'completed' };
    }
    case 'suppliers': {
      const deliveries = load<{ date: string }[]>(STORAGE_KEYS.deliveries, []);
      return { lastUpdated: latestDate(deliveries.map((d) => d.date)) };
    }
    case 'staff': {
      const training = load<{ date: string }[]>(STORAGE_KEYS.trainingRecords, []);
      return { lastUpdated: latestDate(training.map((t) => t.date)) };
    }
    case 'calibration': {
      const cal = load<{ date: string }[]>(STORAGE_KEYS.calibrations, []);
      return { lastUpdated: latestDate(cal.map((c) => c.date)) };
    }
    case 'complaints': {
      const list = load<{ createdAt?: string; date?: string }[]>(STORAGE_KEYS.complaints, []);
      return { lastUpdated: latestDate(list.map((c) => c.createdAt || c.date)) };
    }
    case 'incidents': {
      const list = load<{ date: string }[]>(STORAGE_KEYS.incidents, []);
      return { lastUpdated: latestDate(list.map((c) => c.date)) };
    }
    case 'allergens': {
      const items = load<{ lastUpdated?: string }[]>(STORAGE_KEYS.outsourcedProducts, []);
      return { lastUpdated: latestDate(items.map((i) => i.lastUpdated)) };
    }
    default:
      return {};
  }
}
