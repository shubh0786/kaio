import { format } from 'date-fns';
import { Thermometer, ClipboardCheck, SprayCan, CalendarCheck, type LucideIcon } from 'lucide-react';
import { load } from './storage';
import { STORAGE_KEYS } from './storageKeys';
import type { Unit, TemperatureRecord } from '../temp-log/types';
import type { DiaryEntry } from '../components/DailyDiary';
import type { Tab } from './nav';

export type TaskStatus = 'completed' | 'due' | 'overdue' | 'needs_action';

export interface TodayTask {
  id: string;
  label: string;
  location?: string;
  due: string;
  status: TaskStatus;
  tab: Tab;
  icon: LucideIcon;
}

export interface ComplianceSummary {
  pct: number;
  completed: number;
  missing: number;
  overdue: number;
  total: number;
  insideLabel: string;
  statusLabel: string;
  statusTone: 'good' | 'warn' | 'bad';
}

export function buildTodayTasks(today = format(new Date(), 'yyyy-MM-dd')): TodayTask[] {
  const tasks: TodayTask[] = [];

  // Temperature checks — one per unit
  const units = load<Unit[]>(STORAGE_KEYS.tempUnits, []);
  const records = load<TemperatureRecord[]>(STORAGE_KEYS.tempRecords, []);
  for (const u of units) {
    const logged = records.some((r) => r.unitId === u.id && r.date === today && r.temperature);
    tasks.push({
      id: `temp-${u.id}`,
      label: 'Temperature check',
      location: u.name,
      due: 'Daily',
      status: logged ? 'completed' : 'due',
      tab: 'temps',
      icon: Thermometer,
    });
  }

  // Daily diary
  const diary = load<Record<string, DiaryEntry>>(STORAGE_KEYS.diaryChecks, {});
  const t = diary[today];
  const diaryDone = t ? (t.openingChecks?.some(Boolean) || t.closingChecks?.some(Boolean)) : false;
  tasks.push({
    id: 'diary',
    label: 'Daily diary',
    location: 'Opening & closing',
    due: 'Daily',
    status: diaryDone ? 'completed' : 'due',
    tab: 'diary',
    icon: ClipboardCheck,
  });

  // Cleaning
  const cleaning = load<{ date: string }[]>(STORAGE_KEYS.cleaningLog, []);
  const cleaningToday = cleaning.filter((c) => c.date === today).length;
  tasks.push({
    id: 'cleaning',
    label: 'Cleaning log',
    location: 'Daily tasks',
    due: 'Daily',
    status: cleaningToday > 0 ? 'completed' : 'due',
    tab: 'cleaning',
    icon: SprayCan,
  });

  // 4-week review (overdue only)
  const reviews = load<{ periodEnd?: string; date?: string }[]>(STORAGE_KEYS.reviews, []);
  if (reviews.length > 0) {
    const last = reviews[reviews.length - 1];
    const days = Math.floor((Date.now() - new Date(last.periodEnd || last.date || today).getTime()) / 86400000);
    if (days > 28) {
      tasks.push({
        id: 'review',
        label: '4-week review',
        location: `${days} days overdue`,
        due: 'Overdue',
        status: 'overdue',
        tab: 'review',
        icon: CalendarCheck,
      });
    }
  }

  return tasks;
}

export function computeCompliance(tasks: TodayTask[]): ComplianceSummary {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const overdue = tasks.filter((t) => t.status === 'overdue').length;
  const missing = tasks.filter((t) => t.status === 'due' || t.status === 'needs_action').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let insideLabel = 'Start';
  if (total === 0) insideLabel = 'Set up';
  else if (pct >= 100) insideLabel = 'All done';
  else if (pct >= 50) insideLabel = 'Good';
  else if (pct > 0) insideLabel = 'In progress';

  let statusLabel = 'No tasks set up yet';
  let statusTone: 'good' | 'warn' | 'bad' = 'warn';
  if (total > 0) {
    if (overdue > 0) { statusLabel = `${overdue} task${overdue > 1 ? 's' : ''} overdue`; statusTone = 'bad'; }
    else if (missing > 0) { statusLabel = `${missing} check${missing > 1 ? 's' : ''} left today`; statusTone = 'warn'; }
    else { statusLabel = "You're doing great!"; statusTone = 'good'; }
  }

  return { pct, completed, missing, overdue, total, insideLabel, statusLabel, statusTone };
}
