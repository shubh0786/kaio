import { useState } from 'react';
import { load, save } from '../lib/storage';
import { Plus, Trash2, Edit2, Check, UtensilsCrossed, Grid3X3, Package, Download, FileCheck, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { loadPdfTools, addPdfTitle, TABLE_HEAD_STYLE } from '../lib/exportPdf';
import { STORAGE_KEYS } from '../lib/storageKeys';

const ALLERGENS = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Soy', 'Fish', 'Shellfish', 'Sesame', 'Sulphites', 'Lupin', 'Celery', 'Mustard', 'Molluscs'];

const ALLERGEN_ABBR: Record<string, string> = {
  Gluten: 'Glu', Dairy: 'Dai', Eggs: 'Egg', Nuts: 'Nut', Peanuts: 'Pea',
  Soy: 'Soy', Fish: 'Fish', Shellfish: 'Shel', Sesame: 'Ses', Sulphites: 'Sul',
  Lupin: 'Lup', Celery: 'Cel', Mustard: 'Mus', Molluscs: 'Mol',
};

const MENU_KEY = STORAGE_KEYS.menuItems;
const ALLERGEN_KEY = STORAGE_KEYS.allergens;
const OUTSOURCED_KEY = STORAGE_KEYS.outsourcedProducts;

interface MenuItem {
  id: string;
  name: string;
  category: string;
  allergens: string[];
  notes: string;
}

interface OutsourcedProduct {
  id: string;
  name: string;
  supplier: string;
  ingredients: string;
  allergens: string[];
  mayContain: string[];
  specSheetAvailable: boolean;
  notes: string;
  lastUpdated: string;
}

type Tab = 'items' | 'matrix' | 'outsourced';

export default function AllergenRegister({ recorder }: { recorder: string }) {
  void recorder;
  const [tab, setTab] = useState<Tab>('items');
  const [items, setItems] = useState<MenuItem[]>(() => load(MENU_KEY, []));
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAllergens, setFormAllergens] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');

  const [outsourced, setOutsourced] = useState<OutsourcedProduct[]>(() => load(OUTSOURCED_KEY, []));
  const [showOutsourcedSheet, setShowOutsourcedSheet] = useState(false);
  const [outsourcedEditId, setOutsourcedEditId] = useState<string | null>(null);
  const [outsourcedExpandedId, setOutsourcedExpandedId] = useState<string | null>(null);

  const [opFormName, setOpFormName] = useState('');
  const [opFormSupplier, setOpFormSupplier] = useState('');
  const [opFormIngredients, setOpFormIngredients] = useState('');
  const [opFormAllergens, setOpFormAllergens] = useState<string[]>([]);
  const [opFormMayContain, setOpFormMayContain] = useState<string[]>([]);
  const [opFormSpecSheet, setOpFormSpecSheet] = useState(false);
  const [opFormNotes, setOpFormNotes] = useState('');

  const persist = (updated: MenuItem[]) => {
    setItems(updated);
    save(MENU_KEY, updated);
    const allAllergens = [...new Set(updated.flatMap((i) => i.allergens))];
    save(ALLERGEN_KEY, allAllergens);
  };

  const persistOutsourced = (updated: OutsourcedProduct[]) => {
    setOutsourced(updated);
    save(OUTSOURCED_KEY, updated);
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('');
    setFormAllergens([]);
    setFormNotes('');
    setEditId(null);
  };

  const resetOutsourcedForm = () => {
    setOpFormName('');
    setOpFormSupplier('');
    setOpFormIngredients('');
    setOpFormAllergens([]);
    setOpFormMayContain([]);
    setOpFormSpecSheet(false);
    setOpFormNotes('');
    setOutsourcedEditId(null);
  };

  const openAdd = () => {
    resetForm();
    setShowSheet(true);
  };

  const openEdit = (item: MenuItem) => {
    setFormName(item.name);
    setFormCategory(item.category);
    setFormAllergens([...item.allergens]);
    setFormNotes(item.notes);
    setEditId(item.id);
    setShowSheet(true);
  };

  const openAddOutsourced = () => {
    resetOutsourcedForm();
    setShowOutsourcedSheet(true);
  };

  const openEditOutsourced = (product: OutsourcedProduct) => {
    setOpFormName(product.name);
    setOpFormSupplier(product.supplier);
    setOpFormIngredients(product.ingredients);
    setOpFormAllergens([...product.allergens]);
    setOpFormMayContain([...product.mayContain]);
    setOpFormSpecSheet(product.specSheetAvailable);
    setOpFormNotes(product.notes);
    setOutsourcedEditId(product.id);
    setShowOutsourcedSheet(true);
  };

  const toggleAllergen = (a: string) => {
    setFormAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const toggleOpAllergen = (a: string) => {
    setOpFormAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const toggleOpMayContain = (a: string) => {
    setOpFormMayContain((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;

    if (editId) {
      const updated = items.map((i) =>
        i.id === editId
          ? { ...i, name: formName.trim(), category: formCategory.trim(), allergens: formAllergens, notes: formNotes.trim() }
          : i
      );
      persist(updated);
    } else {
      const entry: MenuItem = {
        id: crypto.randomUUID(),
        name: formName.trim(),
        category: formCategory.trim(),
        allergens: formAllergens,
        notes: formNotes.trim(),
      };
      persist([entry, ...items]);
    }

    setShowSheet(false);
    resetForm();
  };

  const handleOutsourcedSubmit = () => {
    if (!opFormName.trim()) return;

    const now = new Date().toISOString();
    if (outsourcedEditId) {
      const updated = outsourced.map((p) =>
        p.id === outsourcedEditId
          ? {
              ...p,
              name: opFormName.trim(),
              supplier: opFormSupplier.trim(),
              ingredients: opFormIngredients.trim(),
              allergens: opFormAllergens,
              mayContain: opFormMayContain,
              specSheetAvailable: opFormSpecSheet,
              notes: opFormNotes.trim(),
              lastUpdated: now,
            }
          : p
      );
      persistOutsourced(updated);
    } else {
      const entry: OutsourcedProduct = {
        id: crypto.randomUUID(),
        name: opFormName.trim(),
        supplier: opFormSupplier.trim(),
        ingredients: opFormIngredients.trim(),
        allergens: opFormAllergens,
        mayContain: opFormMayContain,
        specSheetAvailable: opFormSpecSheet,
        notes: opFormNotes.trim(),
        lastUpdated: now,
      };
      persistOutsourced([entry, ...outsourced]);
    }

    setShowOutsourcedSheet(false);
    resetOutsourcedForm();
  };

  const deleteItem = (id: string) => {
    persist(items.filter((i) => i.id !== id));
    setExpandedId(null);
  };

  const deleteOutsourced = (id: string) => {
    persistOutsourced(outsourced.filter((p) => p.id !== id));
    setOutsourcedExpandedId(null);
  };

  const exportOutsourcedPdf = async () => {
    if (outsourced.length === 0) return;
    const { jsPDF, autoTable } = await loadPdfTools();
    const doc = new jsPDF({ orientation: 'landscape' });
    addPdfTitle(doc, 'Outsourced Product Allergen Register', 18);

    autoTable(doc, {
      startY: 30,
      head: [['Product', 'Supplier', 'Allergens', 'May Contain', 'Ingredients', 'Spec Sheet', 'Notes']],
      body: outsourced.map((p) => [
        p.name,
        p.supplier,
        p.allergens.join(', ') || '—',
        p.mayContain.join(', ') || '—',
        p.ingredients || '—',
        p.specSheetAvailable ? 'Yes' : 'No',
        p.notes || '—',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: TABLE_HEAD_STYLE,
      columnStyles: {
        4: { cellWidth: 60 },
      },
    });

    doc.save(`outsourced-allergens-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const allergenCheckboxGrid = (
    selected: string[],
    toggle: (a: string) => void,
  ) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ALLERGENS.map((a) => (
        <label
          key={a}
          className="check-row flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.97]"
          style={{
            minHeight: 44,
            background: selected.includes(a) ? 'var(--bg-alt)' : 'transparent',
            border: '1px solid',
            borderColor: selected.includes(a) ? 'var(--navy)' : 'var(--border)',
          }}
        >
          <div
            className="check-box w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
            style={{
              background: selected.includes(a) ? 'var(--navy)' : 'transparent',
              border: selected.includes(a) ? 'none' : '2px solid var(--border)',
            }}
          >
            {selected.includes(a) && <Check size={13} color="#fff" strokeWidth={3} />}
          </div>
          <input
            type="checkbox"
            checked={selected.includes(a)}
            onChange={() => toggle(a)}
            className="sr-only"
            aria-label={a}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{a}</span>
        </label>
      ))}
    </div>
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'items', label: 'Menu Items', icon: <UtensilsCrossed size={16} /> },
    { key: 'matrix', label: 'Matrix', icon: <Grid3X3 size={16} /> },
    { key: 'outsourced', label: 'Outsourced', icon: <Package size={16} /> },
  ];

  return (
    <div className="space-y-4 content-area px-4">
      <div className="card rounded-2xl p-1.5 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? 'shadow-md' : ''
            }`}
            style={tab === t.key ? { background: 'var(--navy)', color: 'var(--btn-primary-text)' } : { color: 'var(--text-muted)' }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No menu items yet</p>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="card rounded-2xl overflow-hidden">
              <div
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="p-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{item.name}</p>
                    {item.category && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.category}</p>
                    )}
                    {item.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.allergens.map((a) => (
                          <span
                            key={a}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-alt)', color: 'var(--navy)' }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.allergens.length === 0 && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>No allergens</p>
                    )}
                  </div>
                </div>
              </div>

              {expandedId === item.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                  {item.notes && (
                    <p className="text-sm pt-3" style={{ color: 'var(--text-muted)' }}>{item.notes}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="btn-outline flex-1 py-3 min-h-[44px] rounded-xl text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 size={15} /> Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="flex-1 py-3 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-red-500 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'matrix' && (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Add menu items to see the allergen matrix</p>
            </div>
          )}

          {items.length > 0 && (
            <div className="card rounded-2xl p-4 allergen-matrix-print">
              <p className="section-header text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Allergen Matrix — {format(new Date(), 'dd MMM yyyy')}
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-xs" style={{ color: 'var(--text)' }}>
                  <thead>
                    <tr>
                      <th className="text-left py-2 pr-3 font-semibold sticky left-0" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', minWidth: 120 }}>
                        Item
                      </th>
                      {ALLERGENS.map((a) => (
                        <th key={a} className="text-center py-2 px-1 font-semibold" style={{ color: 'var(--text-muted)', minWidth: 36 }}>
                          {ALLERGEN_ABBR[a]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td className="py-2 pr-3 font-medium truncate sticky left-0" style={{ background: 'var(--bg-card)', maxWidth: 140 }}>
                          {item.name}
                        </td>
                        {ALLERGENS.map((a) => (
                          <td key={a} className="text-center py-2 px-1">
                            {item.allergens.includes(a) ? (
                              <Check size={14} className="mx-auto" style={{ color: '#22c55e' }} />
                            ) : (
                              <span style={{ color: 'var(--text-faint)' }}>—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'outsourced' && (
        <div className="space-y-3">
          {outsourced.length > 0 && (
            <button
              onClick={exportOutsourcedPdf}
              className="btn-outline w-full py-3 min-h-[44px] rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <Download size={15} /> Export Outsourced Allergens PDF
            </button>
          )}

          {outsourced.length === 0 && (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No outsourced products yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                Track supplier products, ingredients &amp; allergens for audit compliance
              </p>
            </div>
          )}

          {outsourced.map((product) => (
            <div key={product.id} className="card rounded-2xl overflow-hidden">
              <div
                onClick={() => setOutsourcedExpandedId(outsourcedExpandedId === product.id ? null : product.id)}
                className="p-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{product.name}</p>
                      {product.specSheetAvailable ? (
                        <FileCheck size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                      ) : (
                        <FileX size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                      )}
                    </div>
                    {product.supplier && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{product.supplier}</p>
                    )}
                    {product.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {product.allergens.map((a) => (
                          <span
                            key={a}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-alt)', color: 'var(--navy)' }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.mayContain.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {product.mayContain.map((a) => (
                          <span
                            key={`mc-${a}`}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              border: '1.5px dashed var(--text-muted)',
                            }}
                          >
                            {a} (may contain)
                          </span>
                        ))}
                      </div>
                    )}
                    {product.allergens.length === 0 && product.mayContain.length === 0 && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>No allergens</p>
                    )}
                  </div>
                </div>
              </div>

              {outsourcedExpandedId === product.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                  {product.ingredients && (
                    <div className="pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Ingredients</p>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{product.ingredients}</p>
                    </div>
                  )}
                  {product.notes && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{product.notes}</p>
                    </div>
                  )}
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    Spec sheet: {product.specSheetAvailable ? 'Available' : 'Not available'} · Updated {format(new Date(product.lastUpdated), 'dd MMM yyyy')}
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => openEditOutsourced(product)}
                      className="btn-outline flex-1 py-3 min-h-[44px] rounded-xl text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 size={15} /> Edit
                    </button>
                    <button
                      onClick={() => deleteOutsourced(product.id)}
                      className="flex-1 py-3 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-red-500 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'items' && (
        <button onClick={openAdd} className="fab" aria-label="Add menu item">
          <Plus size={26} />
        </button>
      )}

      {tab === 'outsourced' && (
        <button onClick={openAddOutsourced} className="fab" aria-label="Add outsourced product">
          <Plus size={26} />
        </button>
      )}

      {showSheet && (
        <>
          <div className="sheet-overlay" onClick={() => { setShowSheet(false); resetForm(); }} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {editId ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Caesar Salad"
                  aria-label="Name"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Starters, Mains, Desserts"
                  aria-label="Category"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Allergens</label>
                {allergenCheckboxGrid(formAllergens, toggleAllergen)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Cross-contamination risks, preparation notes..."
                  aria-label="Notes"
                  rows={3}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowSheet(false); resetForm(); }}
                  className="btn-outline flex-1 py-3 min-h-[44px] rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1 py-3 min-h-[44px] rounded-xl text-sm">
                  {editId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showOutsourcedSheet && (
        <>
          <div className="sheet-overlay" onClick={() => { setShowOutsourcedSheet(false); resetOutsourcedForm(); }} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {outsourcedEditId ? 'Edit Outsourced Product' : 'Add Outsourced Product'}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Product Name *</label>
                <input
                  type="text"
                  value={opFormName}
                  onChange={(e) => setOpFormName(e.target.value)}
                  placeholder="e.g. Bidfood Ham Slices"
                  aria-label="Product Name"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Supplier</label>
                <input
                  type="text"
                  value={opFormSupplier}
                  onChange={(e) => setOpFormSupplier(e.target.value)}
                  placeholder="e.g. Bidfood, Pandoro, Van Hattem"
                  aria-label="Supplier"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ingredients</label>
                <textarea
                  value={opFormIngredients}
                  onChange={(e) => setOpFormIngredients(e.target.value)}
                  placeholder="Full ingredient list from spec sheet..."
                  aria-label="Ingredients"
                  rows={4}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Allergens (Contains)</label>
                {allergenCheckboxGrid(opFormAllergens, toggleOpAllergen)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>May Contain (Traces)</label>
                {allergenCheckboxGrid(opFormMayContain, toggleOpMayContain)}
              </div>

              <div>
                <label
                  className="check-row flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.97]"
                  style={{
                    minHeight: 44,
                    background: opFormSpecSheet ? 'var(--bg-alt)' : 'transparent',
                    border: '1px solid',
                    borderColor: opFormSpecSheet ? 'var(--navy)' : 'var(--border)',
                  }}
                >
                  <div
                    className="check-box w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: opFormSpecSheet ? 'var(--navy)' : 'transparent',
                      border: opFormSpecSheet ? 'none' : '2px solid var(--border)',
                    }}
                  >
                    {opFormSpecSheet && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={opFormSpecSheet}
                    onChange={() => setOpFormSpecSheet(!opFormSpecSheet)}
                    className="sr-only"
                    aria-label="Spec Sheet Available"
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Spec Sheet Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <textarea
                  value={opFormNotes}
                  onChange={(e) => setOpFormNotes(e.target.value)}
                  placeholder="Storage requirements, cross-contact warnings..."
                  aria-label="Notes"
                  rows={3}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowOutsourcedSheet(false); resetOutsourcedForm(); }}
                  className="btn-outline flex-1 py-3 min-h-[44px] rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button onClick={handleOutsourcedSubmit} className="btn-primary flex-1 py-3 min-h-[44px] rounded-xl text-sm">
                  {outsourcedEditId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media print {
          .allergen-matrix-print { break-inside: avoid; }
          .fab, .sheet, .sheet-overlay { display: none !important; }
        }
      `}</style>
    </div>
  );
}
