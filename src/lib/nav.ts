import {
  Thermometer, ClipboardCheck, SprayCan, Users, Truck, AlertTriangle,
  CalendarCheck, Flame, Snowflake, MoreHorizontal, MessageSquareWarning,
} from 'lucide-react';

export type Tab =
  | 'home' | 'temps' | 'diary' | 'cleaning' | 'staff' | 'suppliers' | 'allergens'
  | 'complaints' | 'incidents' | 'review' | 'cooking' | 'cooling' | 'calibration';

export const ALL_TABS: {
  id: Tab;
  label: string;
  short: string;
  icon: typeof Thermometer;
  desc: string;
}[] = [
  { id: 'home', label: 'Home', short: 'Home', icon: ClipboardCheck, desc: 'Dashboard' },
  { id: 'temps', label: 'Temperature Log', short: 'Temps', icon: Thermometer, desc: 'Fridge & chiller checks' },
  { id: 'diary', label: 'Daily Diary', short: 'Diary', icon: ClipboardCheck, desc: 'Opening & closing checks' },
  { id: 'cleaning', label: 'Cleaning', short: 'Cleaning', icon: SprayCan, desc: 'Cleaning & maintenance' },
  { id: 'staff', label: 'Staff', short: 'Staff', icon: Users, desc: 'Staff & training records' },
  { id: 'suppliers', label: 'Suppliers', short: 'Suppliers', icon: Truck, desc: 'Suppliers & delivery records' },
  { id: 'allergens', label: 'Allergens', short: 'Allergens', icon: AlertTriangle, desc: 'Menu allergen register' },
  { id: 'cooking', label: 'Cooking', short: 'Cooking', icon: Flame, desc: 'Cooking process validation' },
  { id: 'cooling', label: 'Cooling', short: 'Cooling', icon: Snowflake, desc: 'Cooling temperature records' },
  { id: 'calibration', label: 'Calibration', short: 'Calibrate', icon: Thermometer, desc: 'Thermometer calibration' },
  { id: 'complaints', label: 'Complaints', short: 'Complaints', icon: MessageSquareWarning, desc: 'Customer complaints' },
  { id: 'incidents', label: 'Incidents', short: 'Incidents', icon: AlertTriangle, desc: 'When things go wrong' },
  { id: 'review', label: '4-Week Review', short: 'Review', icon: CalendarCheck, desc: 'Periodic FCP review' },
];

export const MOBILE_BAR: Tab[] = ['home', 'temps', 'diary', 'cleaning', 'staff'];
export const MORE_IDS: Tab[] = ['suppliers', 'allergens', 'cooking', 'cooling', 'calibration', 'complaints', 'incidents', 'review'];

export { MoreHorizontal };
