import { useCallback, useMemo, useState } from 'react';
import { load, save, isDemoMode } from '../lib/storage';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { STORAGE_KEYS } from '../lib/storageKeys';

const KEY = STORAGE_KEYS.missedTasks;

export interface MissedTaskRow {
  id: string;
  name: string;
  due: string;
}

export interface MissedCategory {
  id: string;
  name: string;
  tasks: MissedTaskRow[];
}

interface DiaryMove {
  taskId: string;
  categoryId: string;
  performedDate: string;
  note: string;
  movedAt: string;
}

const DIARY_MOVES_KEY = STORAGE_KEYS.diaryMoves;

function defaultData(): MissedCategory[] {
  return [
    {
      id: 'pest',
      name: 'Daily Pest Control',
      tasks: [{ id: 'pest-1', name: 'Daily Pest Control', due: '2026-04-01T05:00:00' }],
    },
    {
      id: 'fridge',
      name: 'Fridge Temperatures',
      tasks: [
        { id: 'f1', name: 'Walk-in chiller', due: '2026-04-01T06:00:00' },
        { id: 'f2', name: 'Display fridge 1', due: '2026-04-01T06:00:00' },
        { id: 'f3', name: 'Display fridge 2', due: '2026-04-01T06:00:00' },
        { id: 'f4', name: 'Prep fridge', due: '2026-04-01T06:00:00' },
        { id: 'f5', name: 'Sandwich unit', due: '2026-04-01T06:00:00' },
      ],
    },
    {
      id: 'clean',
      name: 'Daily Cleaning',
      tasks: [
        { id: 'c1', name: 'Scone & Muffin mixes ready', due: '2026-04-01T05:00:00' },
        { id: 'c2', name: 'Tea Towels stored', due: '2026-04-01T05:00:00' },
        { id: 'c3', name: 'Fridges & Work Benches', due: '2026-04-01T05:00:00' },
      ],
    },
    {
      id: 'freezer',
      name: 'Freezer Temperatures',
      tasks: [
        { id: 'z1', name: 'Chest freezer', due: '2026-04-01T07:00:00' },
        { id: 'z2', name: 'Ice cream freezer', due: '2026-04-01T07:00:00' },
        { id: 'z3', name: 'Stock freezer', due: '2026-04-01T07:00:00' },
      ],
    },
  ];
}

type Toast = { id: string; title: string; body: string };

type Props = { onClose: () => void };

export default function MissedTasksAlerts({ onClose }: Props) {
  const [categories, setCategories] = useState<MissedCategory[]>(() => {
    const d = load<MissedCategory[] | null>(KEY, null);
    if (d?.length) return d;
    return isDemoMode() ? defaultData() : [];
  });
  const [open, setOpen] = useState<Record<string, boolean>>({ pest: true });
  const [modal, setModal] = useState<{ cat: MissedCategory; task: MissedTaskRow } | null>(null);
  const [performedDate, setPerformedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const persist = useCallback((next: MissedCategory[]) => {
    setCategories(next);
    save(KEY, next);
  }, []);

  const totalMissed = useMemo(
    () => categories.reduce((n, c) => n + c.tasks.length, 0),
    [categories],
  );

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((x) => [...x, { ...t, id }]);
    setTimeout(() => setToasts((x) => x.filter((o) => o.id !== id)), 4500);
  };

  const dismissToast = (id: string) => setToasts((x) => x.filter((o) => o.id !== id));

  const moveToDiary = () => {
    if (!modal) return;
    const moves = load<DiaryMove[]>(DIARY_MOVES_KEY, []);
    moves.push({
      taskId: modal.task.id,
      categoryId: modal.cat.id,
      performedDate,
      note,
      movedAt: new Date().toISOString(),
    });
    save(DIARY_MOVES_KEY, moves);

    const nextCats = categories
      .map((c) => {
        if (c.id !== modal.cat.id) return c;
        return { ...c, tasks: c.tasks.filter((t) => t.id !== modal.task.id) };
      })
      .filter((c) => c.tasks.length > 0);
    persist(nextCats);

    pushToast({
      title: 'Task moved to diary',
      body: `Task '${modal.task.name}' has been moved to your diary`,
    });
    setModal(null);
    setNote('');
  };

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0f1419', color: '#e8eaee' }}>
      <header className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#2c3642' }}>
        <div>
          <p className="text-[10px] uppercase tracking-wide opacity-60">chomp HQ style</p>
          <h1 className="text-lg font-bold">Missed Tasks</h1>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5" aria-label="Close">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <p className="text-xs opacity-70 mb-2">Showing expired tasks / missed entries from all categories</p>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <div>
            <p className="text-xl font-bold">{format(new Date(), 'EEEE d MMMM')}</p>
            <p className="text-sm opacity-80 mt-1">Total daily missed tasks: {totalMissed}</p>
            <p className="text-sm opacity-80">Total daily missed categories: {categories.length}</p>
          </div>
          <button
            type="button"
            className="text-sm px-3 py-2 rounded-lg border font-medium"
            style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
          >
            Mark venue as closed for this day
          </button>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#2c3642', background: '#1c242d' }}>
          <div className="grid grid-cols-[48px_1fr_100px] gap-2 text-xs font-semibold uppercase tracking-wide opacity-60 px-3 py-2 border-b" style={{ borderColor: '#2c3642' }}>
            <span>Expand</span>
            <span>Category</span>
            <span className="text-right">Missed</span>
          </div>
          {categories.map((cat) => {
            const expanded = open[cat.id];
            return (
              <div key={cat.id} style={{ borderBottom: '1px solid #2c3642' }}>
                <button
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className="w-full grid grid-cols-[48px_1fr_100px] gap-2 items-center px-3 py-3 text-left text-sm hover:bg-white/5"
                >
                  <span>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                  <span>{cat.name}</span>
                  <span className="text-right">{cat.tasks.length}</span>
                </button>
                {expanded && (
                  <div className="px-3 pb-3 pl-12">
                    <div className="rounded-md overflow-hidden border text-xs" style={{ borderColor: '#2c3642' }}>
                      <div className="grid grid-cols-[1fr_140px_140px] gap-2 px-2 py-1.5 opacity-60 font-semibold" style={{ background: '#131920' }}>
                        <span>Task</span>
                        <span>Due</span>
                        <span className="text-right">Action</span>
                      </div>
                      {cat.tasks.map((t) => (
                        <div
                          key={t.id}
                          className="grid grid-cols-[1fr_140px_140px] gap-2 px-2 py-2 items-center border-t"
                          style={{ borderColor: '#2c3642' }}
                        >
                          <span>{t.name}</span>
                          <span className="opacity-80">
                            {format(new Date(t.due), 'dd/MM/yyyy')} @ {format(new Date(t.due), 'h:mm a').toLowerCase()}
                          </span>
                          <span className="text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setModal({ cat, task: t });
                                setPerformedDate(format(new Date(), 'yyyy-MM-dd'));
                              }}
                              className="font-medium"
                              style={{ color: '#38bdf8' }}
                            >
                              Move task to diary
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <>
          <div className="absolute inset-0 z-[110] bg-black/60" onClick={() => setModal(null)} aria-hidden />
          <div
            className="absolute left-1/2 top-[12%] z-[120] w-[min(100%,400px)] -translate-x-1/2 rounded-xl border p-5 shadow-xl"
            style={{ background: '#1c242d', borderColor: '#2c3642' }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-base font-bold">{modal.task.name}</h3>
                <p className="text-xs opacity-60 mt-1">Task due: {modal.task.due ? format(parseISO(modal.task.due), 'EEEE d MMMM') : 'Today'}</p>
              </div>
              <button type="button" onClick={() => setModal(null)} className="p-1 opacity-60"><X size={18} /></button>
            </div>
            <label className="block text-xs font-semibold mt-4 mb-1">Select the date the task was performed</label>
            <input
              type="date"
              value={performedDate}
              onChange={(e) => setPerformedDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm mb-4"
              style={{ background: '#131920', border: '1px solid #2c3642', color: '#e8eaee' }}
            />
            <label className="block text-xs font-semibold mb-1">Diary entry note (recommended)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about why this task wasn't done on time, and any other details about what happened"
              className="w-full rounded-lg px-3 py-2 text-sm resize-y"
              style={{ background: '#131920', border: '1px solid #2c3642', color: '#e8eaee' }}
            />
            <button
              type="button"
              onClick={moveToDiary}
              className="w-full mt-4 py-3 rounded-lg font-bold text-black"
              style={{ background: '#f97316' }}
            >
              Move task to diary
            </button>
          </div>
        </>
      )}

      <div className="fixed top-20 right-4 z-[130] flex flex-col gap-2 max-w-[320px] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-lg border p-3 shadow-lg text-sm relative overflow-hidden"
            style={{ background: '#1c242d', borderColor: '#2c3642' }}
          >
            <button type="button" onClick={() => dismissToast(t.id)} className="absolute top-2 right-2 opacity-50 hover:opacity-100" aria-label="Dismiss">
              <X size={14} />
            </button>
            <p className="font-semibold pr-6">{t.title}</p>
            <p className="text-xs opacity-80 mt-1">{t.body}</p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500/80 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
