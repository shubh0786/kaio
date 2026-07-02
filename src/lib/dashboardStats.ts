import { differenceInDays, format } from 'date-fns';
import { load } from './storage';
import { STORAGE_KEYS } from './storageKeys';
import type { Unit, TemperatureRecord } from '../temp-log/types';
import type { DiaryEntry } from '../components/DailyDiary';

interface ReviewSummary {
  periodEnd?: string;
  date?: string;
}

interface TrainingRecord {
  date: string;
}

export interface DashboardStats {
  tempUnits: number;
  tempsLogged: number;
  diaryDone: boolean;
  cleaningToday: number;
  deliveriesToday: number;
  reviewOverdue: boolean;
  daysSinceReview: number;
  staffCount: number;
  recentTraining: number;
  suppliers: number;
  incidents: number;
  complaints: number;
}

export function computeDashboardStats(today = format(new Date(), 'yyyy-MM-dd'), _refresh = 0): DashboardStats {
  void _refresh;
  const tempUnits = load<Unit[]>(STORAGE_KEYS.tempUnits, []);
  const tempRecords = load<TemperatureRecord[]>(STORAGE_KEYS.tempRecords, []);
  const tempsLogged = tempUnits.filter((u) =>
    tempRecords.some((r) => r.unitId === u.id && r.date === today && r.temperature),
  ).length;

  const diary = load<Record<string, DiaryEntry>>(STORAGE_KEYS.diaryChecks, {});
  const todayDiary = diary[today];
  const diaryDone = todayDiary
    ? (todayDiary.openingChecks?.some(Boolean) || todayDiary.closingChecks?.some(Boolean))
    : false;

  const cleaning = load<{ date: string }[]>(STORAGE_KEYS.cleaningLog, []);
  const cleaningToday = cleaning.filter((c) => c.date === today).length;

  const deliveries = load<{ date: string }[]>(STORAGE_KEYS.deliveries, []);
  const deliveriesToday = deliveries.filter((d) => d.date === today).length;

  const reviews = load<ReviewSummary[]>(STORAGE_KEYS.reviews, []);
  const lastReview = reviews.length > 0 ? reviews[reviews.length - 1] : null;
  const daysSinceReview = lastReview
    ? differenceInDays(new Date(), new Date(lastReview.periodEnd || lastReview.date || today))
    : 999;
  const reviewOverdue = daysSinceReview > 28;

  const staff = load<unknown[]>(STORAGE_KEYS.staffList, []);
  const training = load<TrainingRecord[]>(STORAGE_KEYS.trainingRecords, []);
  const recentTraining = training.filter((t) => differenceInDays(new Date(), new Date(t.date)) < 90).length;

  return {
    tempUnits: tempUnits.length,
    tempsLogged,
    diaryDone,
    cleaningToday,
    deliveriesToday,
    reviewOverdue,
    daysSinceReview,
    staffCount: staff.length,
    recentTraining,
    suppliers: load<unknown[]>(STORAGE_KEYS.suppliers, []).length,
    incidents: load<unknown[]>(STORAGE_KEYS.incidents, []).length,
    complaints: load<unknown[]>(STORAGE_KEYS.complaints, []).length,
  };
}
