import {
  Thermometer, ClipboardCheck, SprayCan, Users, Truck, AlertTriangle,
  CalendarCheck, Flame, Snowflake, MessageSquareWarning, ListChecks,
  ShieldCheck, Settings as SettingsIcon, FlaskConical,
} from 'lucide-react';
import type { Area } from './route';

export type Tab =
  | 'today' | 'records' | 'verify' | 'settings'
  | 'temps' | 'diary' | 'cleaning' | 'staff' | 'suppliers' | 'allergens'
  | 'complaints' | 'incidents' | 'review' | 'cooking' | 'cooling'
  | 'calibration' | 'kitchen' | 'proven';

/** The four primary navigation areas. */
export const AREA_NAV: { id: Area; label: string; short: string; icon: typeof Thermometer }[] = [
  { id: 'today', label: 'Today', short: 'Today', icon: ListChecks },
  { id: 'records', label: 'Records', short: 'Records', icon: ClipboardCheck },
  { id: 'verify', label: 'Verify', short: 'Verify', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', short: 'Settings', icon: SettingsIcon },
];

/** Metadata for every module/form view. */
export const MODULES: {
  id: Tab;
  label: string;
  short: string;
  icon: typeof Thermometer;
  desc: string;
}[] = [
  { id: 'temps', label: 'Temperature checks', short: 'Temps', icon: Thermometer, desc: 'Fridge & chiller checks' },
  { id: 'diary', label: 'Daily diary', short: 'Diary', icon: ClipboardCheck, desc: 'Opening & closing checks' },
  { id: 'cleaning', label: 'Cleaning', short: 'Cleaning', icon: SprayCan, desc: 'Cleaning & maintenance' },
  { id: 'cooking', label: 'Cooking validation', short: 'Cooking', icon: Flame, desc: 'Cooking process validation' },
  { id: 'cooling', label: 'Cooling records', short: 'Cooling', icon: Snowflake, desc: 'Cooling temperature records' },
  { id: 'kitchen', label: 'Kitchen tasks', short: 'Tasks', icon: ListChecks, desc: 'Daily kitchen task manager' },
  { id: 'suppliers', label: 'Suppliers', short: 'Suppliers', icon: Truck, desc: 'Suppliers & delivery records' },
  { id: 'staff', label: 'Staff training', short: 'Staff', icon: Users, desc: 'Staff & training records' },
  { id: 'allergens', label: 'Allergen matrix', short: 'Allergens', icon: AlertTriangle, desc: 'Menu allergen register' },
  { id: 'calibration', label: 'Calibration', short: 'Calibrate', icon: Thermometer, desc: 'Thermometer calibration' },
  { id: 'proven', label: 'Proven cooking methods', short: 'Proven', icon: FlaskConical, desc: 'Proven method audit view' },
  { id: 'complaints', label: 'Complaints', short: 'Complaints', icon: MessageSquareWarning, desc: 'Customer complaints' },
  { id: 'incidents', label: 'Incidents', short: 'Incidents', icon: AlertTriangle, desc: 'When things go wrong' },
  { id: 'review', label: '4-week review', short: 'Review', icon: CalendarCheck, desc: 'Periodic FCP review' },
];

export function moduleMeta(id: Tab) {
  return MODULES.find((m) => m.id === id);
}

/** Records screen groupings. */
export const RECORDS_GROUPS: { title: string; ids: Tab[] }[] = [
  {
    title: 'Daily records',
    ids: ['temps', 'diary', 'cleaning', 'cooking', 'cooling', 'kitchen'],
  },
  {
    title: 'Business records',
    ids: ['suppliers', 'staff', 'allergens', 'calibration', 'proven'],
  },
  {
    title: 'Issues & reviews',
    ids: ['incidents', 'complaints', 'review'],
  },
];

export { MoreHorizontal } from 'lucide-react';
