/** Central registry of localStorage keys used by Kaio. */
export const STORAGE_PREFIXES = ['cafe-', 'kaio-'] as const;

export const STORAGE_KEYS = {
  recorder: 'cafe-recorder',
  theme: 'cafe-theme',
  homeMode: 'kaio-home-mode',
  venueTitle: 'kaio-venue-title',
  tempUnits: 'cafe-tl-units',
  tempRecords: 'cafe-tl-records',
  tempNotes: 'cafe-tl-notes',
  tempScreen: 'cafe-tl-screen',
  diaryChecks: 'cafe-diary-checks',
  cleaningLog: 'cafe-cleaning-log',
  maintenanceLog: 'cafe-maintenance-log',
  staffList: 'cafe-staff-list',
  trainingRecords: 'cafe-training-records',
  sicknessLog: 'cafe-sickness-log',
  suppliers: 'cafe-suppliers',
  deliveries: 'cafe-deliveries',
  complaints: 'cafe-complaints',
  incidents: 'cafe-incidents',
  reviews: 'cafe-reviews',
  menuItems: 'kaio-menu-items',
  allergens: 'kaio-allergens',
  outsourcedProducts: 'kaio-outsourced-products',
  cookingMethods: 'kaio-cooking-methods',
  weeklyCookingChecks: 'kaio-weekly-cooking-checks',
  coolingMethods: 'kaio-cooling-methods',
  weeklyCoolingChecks: 'kaio-weekly-cooling-checks',
  calibrations: 'kaio-calibrations',
  kitchenTasks: 'kaio-kitchen-tasks-v1',
  missedTasks: 'kaio-missed-tasks-v1',
  diaryMoves: 'kaio-diary-moves-v1',
} as const;

export function isKaioStorageKey(key: string): boolean {
  return STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));
}
