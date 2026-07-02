export interface Unit {
  id: string;
  name: string;
  minTemp: number;
  maxTemp: number;
}

export interface TemperatureRecord {
  unitId: string;
  date: string;
  temperature: string;
  correctiveAction?: string;
}

export interface DailyNote {
  date: string;
  note: string;
  recorder: string;
}

export type TempScreen = 'landing' | 'logging' | 'complete' | 'records' | 'dashboard' | 'calendar';

export const ACCENT = '#0a5e5e';
export const ACCENT_LIGHT = '#0d7a7a';
export const GOLD = '#14b8a6';

export const UNIT_PRESETS = [
  { label: 'Fridge', min: 0, max: 5 },
  { label: 'Chiller', min: -2, max: 2 },
  { label: 'Freezer', min: -25, max: -18 },
] as const;

export const CHART_COLORS = ['#0a5e5e', '#14b8a6', '#0d7a7a', '#e6c66e', '#003d8f', '#d4af37', '#0050b3', '#8b6914'];
export const CONFETTI_COLORS = ['#0a5e5e', '#14b8a6', '#0d7a7a', '#e6c66e', '#ffffff', '#d4af37', '#003d8f', '#f5e6b8'];
