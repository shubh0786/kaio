import { useMemo, useState } from 'react';
import { load, save } from '../lib/storage';
import {
  ChevronDown, ChevronRight, Calendar, CheckCheck, X, Folder, UtensilsCrossed,
} from 'lucide-react';
import { format } from 'date-fns';
import { STORAGE_KEYS } from '../lib/storageKeys';

const KEY = STORAGE_KEYS.kitchenTasks;

export type KitchenGroupId = 'food' | 'equipment' | 'team' | 'facility';

export interface KitchenTask {
  id: string;
  folderId: string;
  name: string;
  methodLines: string[];
  frequencyLabel: string;
  nextOccurrence: string;
  proveDone: number;
  proveTotal: number;
}

export interface KitchenFolder {
  id: string;
  groupId: KitchenGroupId;
  name: string;
}

interface Store {
  groups: { id: KitchenGroupId; label: string }[];
  folders: KitchenFolder[];
  tasks: KitchenTask[];
}

const DEFAULT_STORE: Store = {
  groups: [
    { id: 'food', label: 'Food' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'team', label: 'Team' },
    { id: 'facility', label: 'Facility' },
  ],
  folders: [
    { id: 'f-cool', groupId: 'food', name: 'Cooling Hot Food' },
    { id: 'f-meat', groupId: 'food', name: 'Meat or Poultry Temperatures' },
    { id: 'f-reheat', groupId: 'food', name: 'Reheating Food' },
    { id: 'f-eq', groupId: 'equipment', name: 'General' },
    { id: 'f-team', groupId: 'team', name: 'Training' },
    { id: 'f-fac', groupId: 'facility', name: 'General' },
  ],
  tasks: [
    {
      id: 't1',
      folderId: 'f-cool',
      name: 'Sausage Rolls (example)',
      methodLines: [
        'Cool from 60°C to 21°C within 2 hours, then to 5°C within 4 hours.',
        'Record temperatures in Kaio as you go.',
      ],
      frequencyLabel: 'Weekly (Thursday)',
      nextOccurrence: '2026-04-16T00:00:00',
      proveDone: 3,
      proveTotal: 3,
    },
    {
      id: 't2',
      folderId: 'f-cool',
      name: 'Quiche (example)',
      methodLines: ['Cool rapidly using shallow trays.', 'Probe thickest part.'],
      frequencyLabel: 'Weekly (Thursday)',
      nextOccurrence: '2026-04-16T00:00:00',
      proveDone: 1,
      proveTotal: 3,
    },
    {
      id: 't3',
      folderId: 'f-meat',
      name: 'Sausage (example).',
      methodLines: [
        'Fry sausage until golden, place in oven for 4mins.',
        'Cook sausages thoroughly until the internal temperature reaches at least 75°C throughout.',
        'Checking with a calibrated probe thermometer in the thickest part of the product',
      ],
      frequencyLabel: 'Weekly (Thursday)',
      nextOccurrence: '2026-04-16T00:00:00',
      proveDone: 3,
      proveTotal: 3,
    },
    {
      id: 't4',
      folderId: 'f-meat',
      name: 'Fried Chicken Burger (example).',
      methodLines: ['Cook to 75°C core.', 'Rest before serve.'],
      frequencyLabel: 'Weekly (Thursday)',
      nextOccurrence: '2026-04-16T00:00:00',
      proveDone: 2,
      proveTotal: 3,
    },
  ],
};

const BG = '#0f0f0f';
const CARD = '#1e1e1e';
const ORANGE = '#f97316';
const BLUE = '#38bdf8';

type Props = { onClose: () => void };

export default function KitchenTaskManager({ onClose }: Props) {
  const [store, setStore] = useState<Store>(() => {
    const s = load<Store | null>(KEY, null);
    if (s?.tasks?.length) return s;
    save(KEY, DEFAULT_STORE);
    return DEFAULT_STORE;
  });
  const [openGroups, setOpenGroups] = useState<Record<KitchenGroupId, boolean>>({
    food: true, equipment: false, team: false, facility: false,
  });
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'f-cool': true, 'f-meat': true, 'f-reheat': false, 'f-eq': false, 'f-team': false, 'f-fac': false,
  });
  const [selectedId, setSelectedId] = useState<string | null>('t1');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wStep, setWStep] = useState(1);
  const [wGroup, setWGroup] = useState<KitchenGroupId>('food');
  const [wFolder, setWFolder] = useState('');
  const [wTemplate, setWTemplate] = useState('weekly-meat');

  const selected = useMemo(() => store.tasks.find((t) => t.id === selectedId) || null, [store.tasks, selectedId]);

  const foldersInGroup = (g: KitchenGroupId) => store.folders.filter((f) => f.groupId === g);

  const toggleGroup = (g: KitchenGroupId) =>
    setOpenGroups((o) => ({ ...o, [g]: !o[g] }));

  const toggleFolder = (id: string) =>
    setOpenFolders((o) => ({ ...o, [id]: !o[id] }));

  const addTaskFromWizard = () => {
    setStore((prev) => {
      const folder = prev.folders.find((f) => f.id === wFolder) || prev.folders.find((f) => f.groupId === wGroup);
      if (!folder) return prev;
      const templates: Record<string, Partial<KitchenTask>> = {
        'weekly-meat': {
          name: 'New meat batch test',
          methodLines: ['Cook to 75°C core.', 'Probe thickest part.', 'Record in Kaio.'],
          proveTotal: 3,
          proveDone: 0,
        },
        'every-meat': {
          name: 'Every batch test',
          methodLines: ['Check each batch to 75°C.', 'Log batch ID.'],
          proveTotal: 3,
          proveDone: 0,
        },
      };
      const base = templates[wTemplate] || templates['weekly-meat'];
      const task: KitchenTask = {
        id: crypto.randomUUID(),
        folderId: folder.id,
        name: base.name || 'New task',
        methodLines: base.methodLines || [],
        frequencyLabel: 'Weekly (Thursday)',
        nextOccurrence: new Date().toISOString(),
        proveDone: base.proveDone ?? 0,
        proveTotal: base.proveTotal ?? 3,
      };
      const next = { ...prev, tasks: [...prev.tasks, task] };
      save(KEY, next);
      setSelectedId(task.id);
      setWizardOpen(false);
      setWStep(1);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: BG, color: '#e5e5e5' }}>
      <header className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#2a2a2a' }}>
        <h1 className="text-sm font-bold tracking-wide" style={{ color: ORANGE }}>Kitchen App</h1>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5" aria-label="Close">
          <X size={20} />
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[280px] shrink-0 border-r flex flex-col" style={{ borderColor: '#2a2a2a', background: '#0a0a0a' }}>
          <button
            type="button"
            onClick={() => { setWizardOpen(true); setWStep(1); setWGroup('food'); setWFolder(foldersInGroup('food')[0]?.id || ''); }}
            className="m-3 py-3 px-3 rounded-lg text-sm font-bold text-black"
            style={{ background: ORANGE }}
          >
            Add a new task
          </button>
          <nav className="flex-1 overflow-y-auto px-2 pb-4 text-[13px]">
            {store.groups.map((g) => {
              const fds = foldersInGroup(g.id);
              const open = openGroups[g.id];
              return (
                <div key={g.id} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 text-left"
                  >
                    {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <UtensilsCrossed size={14} className="opacity-70" />
                    <span className="font-semibold flex-1">{g.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded opacity-80" style={{ background: '#1e3a5f', color: BLUE }}>{g.label}</span>
                  </button>
                  {open && (
                    <div className="ml-4 pl-2 border-l border-white/10">
                      {fds.map((fd) => {
                        const tasks = store.tasks.filter((t) => t.folderId === fd.id);
                        const fo = openFolders[fd.id];
                        return (
                          <div key={fd.id}>
                            <button
                              type="button"
                              onClick={() => toggleFolder(fd.id)}
                              className="w-full flex items-center gap-2 py-1.5 text-left opacity-90"
                            >
                              {fo ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <Folder size={14} className="opacity-60" />
                              <span>{fd.name}</span>
                            </button>
                            {fo && (
                              <ul className="ml-6 mb-2 space-y-0.5">
                                {tasks.map((t) => {
                                  const active = t.id === selectedId;
                                  return (
                                    <li key={t.id}>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedId(t.id)}
                                        className="w-full text-left py-1.5 px-2 rounded flex items-center gap-2"
                                        style={
                                          active
                                            ? { background: '#2d2419', color: ORANGE }
                                            : { color: '#ddd' }
                                        }
                                      >
                                        <Calendar size={12} className="shrink-0 opacity-70" />
                                        <span className="truncate">{t.name}</span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selected ? (
            <p className="text-sm opacity-60">Select a task from the list.</p>
          ) : (
            <div className="max-w-2xl rounded-xl p-5 border" style={{ background: CARD, borderColor: '#333' }}>
              <h2 className="text-lg font-bold text-white mb-1">{selected.name}</h2>
              <p className="text-xs opacity-70 mb-1">
                Category: {store.folders.find((f) => f.id === selected.folderId)?.name}
              </p>
              <p className="text-xs opacity-70 mb-4">
                Group: {store.groups.find((g) => g.id === store.folders.find((f) => f.id === selected.folderId)?.groupId)?.label}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border" style={{ borderColor: BLUE, color: BLUE }}>
                  <Calendar size={12} /> Scheduled
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border" style={{ borderColor: BLUE, color: BLUE }}>
                  <CheckCheck size={12} /> Prove your method — {selected.proveDone} / {selected.proveTotal}
                </span>
              </div>
              <p className="text-sm opacity-80 mb-1">Frequency: {selected.frequencyLabel}</p>
              <p className="text-sm opacity-80 mb-6">
                Next occurrence:{' '}
                {format(new Date(selected.nextOccurrence), 'dd/MM/yyyy')} @ 12:00am
              </p>
              <p className="text-sm font-semibold text-white mb-2">Method:</p>
              <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
                {selected.methodLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 mt-8 text-sm">
                <button type="button" className="font-medium" style={{ color: BLUE }}>Edit task</button>
                <button type="button" className="font-medium" style={{ color: BLUE }}>View diary</button>
                <button type="button" className="font-medium opacity-60">Archive</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {wizardOpen && (
        <>
          <div className="absolute inset-0 z-[110] bg-black/70" onClick={() => setWizardOpen(false)} aria-hidden />
          <div
            className="absolute left-1/2 top-1/2 z-[120] w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-5 shadow-xl"
            style={{ background: '#1a1a1a', borderColor: '#333' }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-base font-bold text-white">Add a new task</h3>
                <p className="text-xs opacity-60 mt-1">Make a new task that will show on your Kitchen App</p>
              </div>
              <button type="button" onClick={() => setWizardOpen(false)} className="p-1 opacity-60"><X size={18} /></button>
            </div>
            <div className="flex items-center justify-between gap-1 my-5 text-[10px] font-semibold">
              {[
                { step: 1, label: 'Food' },
                { step: 2, label: 'Meat or Poultry Temperatures' },
                { step: 3, label: 'Select a Template' },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center flex-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: wStep >= s.step ? ORANGE : '#444' }}
                  >
                    {s.step}
                  </div>
                  {i < 2 && <div className="flex-1 h-0.5 mx-1" style={{ background: wStep > s.step ? ORANGE : '#444' }} />}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-center opacity-70 mb-3">
              {wStep === 1 && 'Choose group'}
              {wStep === 2 && 'Choose folder'}
              {wStep === 3 && 'Choose a template to get started, you can tweak the settings later'}
            </p>
            {wStep === 1 && (
              <select
                value={wGroup}
                onChange={(e) => {
                  const g = e.target.value as KitchenGroupId;
                  setWGroup(g);
                  const f = foldersInGroup(g)[0];
                  setWFolder(f?.id || '');
                }}
                className="w-full rounded-lg px-3 py-2 text-sm bg-zinc-800 border border-zinc-600 text-white"
              >
                {store.groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            )}
            {wStep === 2 && (
              <select
                value={wFolder}
                onChange={(e) => setWFolder(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm bg-zinc-800 border border-zinc-600 text-white"
              >
                {foldersInGroup(wGroup).map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
            {wStep === 3 && (
              <div className="relative">
                <select
                  value={wTemplate}
                  onChange={(e) => setWTemplate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-zinc-800 border border-zinc-600 text-white appearance-none"
                >
                  <option value="weekly-meat">Meat or Poultry Temperatures — Weekly Batch Test</option>
                  <option value="every-meat">Meat or Poultry Temperatures — Every Batch Test</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              {wStep > 1 && (
                <button type="button" onClick={() => setWStep((s) => s - 1)} className="px-3 py-2 text-sm rounded-lg border border-zinc-600">
                  Back
                </button>
              )}
              {wStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setWStep((s) => s + 1)}
                  className="px-4 py-2 text-sm rounded-lg font-semibold text-black"
                  style={{ background: ORANGE }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addTaskFromWizard}
                  className="px-4 py-2 text-sm rounded-lg font-semibold text-black"
                  style={{ background: ORANGE }}
                >
                  Create task
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
