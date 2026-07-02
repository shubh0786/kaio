import {
  Snowflake, Thermometer, Settings, Timer, Bug, Wrench, Truck,
  AlertOctagon, Briefcase, ClipboardCheck, User,
} from 'lucide-react';

export type AuditNavAction =
  | { type: 'tab'; id: string }
  | { type: 'proven' }
  | { type: 'kitchen' }
  | { type: 'alerts' };

type SubItem = { label: string; action: AuditNavAction };

export type AuditCategory = {
  id: string;
  label: string;
  icon: typeof Snowflake;
  subs?: SubItem[];
  direct?: AuditNavAction;
};

export const AUDIT_CATEGORIES: AuditCategory[] = [
  { id: 'refrigeration', label: 'REFRIGERATION', icon: Snowflake, direct: { type: 'tab', id: 'temps' } },
  { id: 'food-temp', label: 'FOOD TEMPERATURES', icon: Thermometer, direct: { type: 'tab', id: 'temps' } },
  {
    id: 'reheat-cool',
    label: 'REHEATING AND COOLING',
    icon: Thermometer,
    subs: [
      { label: 'Cooking validation', action: { type: 'tab', id: 'cooking' } },
      { label: 'Cooling records', action: { type: 'tab', id: 'cooling' } },
    ],
  },
  { id: 'calibrations', label: 'CALIBRATIONS', icon: Settings, direct: { type: 'tab', id: 'calibration' } },
  { id: 'cleaning', label: 'CLEANING', icon: Timer, direct: { type: 'tab', id: 'cleaning' } },
  { id: 'pest', label: 'PEST CONTROL', icon: Bug, direct: { type: 'tab', id: 'cleaning' } },
  { id: 'maintenance', label: 'MAINTENANCE', icon: Wrench, direct: { type: 'tab', id: 'cleaning' } },
  { id: 'sending', label: 'SENDING AND RECEIVING', icon: Truck, direct: { type: 'tab', id: 'suppliers' } },
  {
    id: 'sickness',
    label: 'SICKNESS, COMPLAINTS AND RECALLS',
    icon: AlertOctagon,
    subs: [
      { label: 'Customer complaints', action: { type: 'tab', id: 'complaints' } },
      { label: 'Incidents & recalls', action: { type: 'tab', id: 'incidents' } },
    ],
  },
  { id: 'open-closed', label: 'OPEN AND CLOSED LIST', icon: Briefcase, direct: { type: 'tab', id: 'diary' } },
  { id: 'self-audit', label: 'SELF AUDIT', icon: ClipboardCheck, direct: { type: 'tab', id: 'review' } },
  {
    id: 'proven',
    label: 'PROVEN COOKING METHODS',
    icon: User,
    subs: [
      { label: 'Meat or Poultry Temperatures — Weekly Batch Test', action: { type: 'proven' } },
      { label: 'Reheating Food — Weekly Batch Test', action: { type: 'tab', id: 'cooking' } },
      { label: 'Cooling Hot Food — Weekly Check', action: { type: 'tab', id: 'cooling' } },
    ],
  },
  {
    id: 'staff-suppliers',
    label: 'STAFF AND SUPPLIERS',
    icon: User,
    subs: [
      { label: 'Staff training (audit view)', action: { type: 'tab', id: 'staff' } },
      { label: 'Suppliers & deliveries', action: { type: 'tab', id: 'suppliers' } },
    ],
  },
];
