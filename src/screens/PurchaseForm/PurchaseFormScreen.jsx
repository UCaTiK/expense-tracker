import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import PlaceAutocomplete from './PlaceAutocomplete';
import DateField from './DateField';
import QuickForm from './QuickForm';
import DetailedForm from './DetailedForm';
import TagPicker from './TagPicker';
import { usePurchase } from '../../hooks/usePurchases';
import { usePurchaseItems } from '../../hooks/usePurchaseItems';
import { usePlaceRecord } from '../../hooks/usePlaces';
import { savePurchase } from '../../db/purchases';
import { fieldLabelStyle, inputStyle } from '../../lib/formStyles';

const emptyState = () => ({
  mode: 'quick',
  place: '',
  date: Date.now(),
  totalPaid: '',
  note: '',
  tagIds: [],
  quickCategoryId: null,
  items: [],
});

export default function PurchaseFormScreen({ purchaseId, onDone, onCancel }) {
  const existing = usePurchase(purchaseId);
  const existingItems = usePurchaseItems(purchaseId);
  const [form, setForm] = useState(emptyState());
  const [initialized, setInitialized] = useState(!purchaseId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (purchaseId && existing && existingItems && !initialized) {
      setForm({
        mode: existing.needsDetail ? 'quick' : 'detailed',
        place: existing.place || '',
        date: existing.date,
        totalPaid: String(existing.totalPaid ?? ''),
        note: existing.note || '',
        tagIds: existing.tagIds || [],
        quickCategoryId: existing.needsDetail ? existing.categoryId : null,
        items: existingItems.map((it) => ({ ...it, amount: String(it.amount) })),
      });
      setInitialized(true);
    }
  }, [purchaseId, existing, existingItems, initialized]);

  // Learned place->category suggestion (quick mode only, new purchases
  // only — never overrides an already-saved purchase's category, and never
  // overrides a category the user picked by hand in this session).
  const categoryTouchedRef = useRef(Boolean(purchaseId));
  const placeSuggestion = usePlaceRecord(!purchaseId && form.mode === 'quick' ? form.place : null);

  useEffect(() => {
    if (purchaseId || form.mode !== 'quick' || categoryTouchedRef.current) return;
    if (placeSuggestion?.defaultCategoryId) {
      setForm((f) => ({ ...f, quickCategoryId: placeSuggestion.defaultCategoryId }));
    }
  }, [placeSuggestion, purchaseId, form.mode]);

  const handleQuickCategoryChange = (id) => {
    categoryTouchedRef.current = true;
    setForm((f) => ({ ...f, quickCategoryId: id }));
  };

  if (purchaseId && !initialized) return null;

  const canSave =
    form.place.trim() &&
    Number(form.totalPaid) > 0 &&
    (form.mode === 'quick' ? Boolean(form.quickCategoryId) : true);

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const id = await savePurchase({
        id: purchaseId || undefined,
        date: form.date,
        place: form.place,
        totalPaid: form.totalPaid,
        note: form.note,
        tagIds: form.tagIds,
        mode: form.mode,
        quickCategoryId: form.quickCategoryId,
        items: form.items,
      });
      onDone(id);
    } finally {
      setSaving(false);
    }
  };

  return (
    // Header (back/title/mode toggle) and the Save footer are fixed,
    // non-scrolling flex siblings — only the middle field area scrolls, so
    // Save and the mode toggle stay reachable no matter how long the form
    // gets (e.g. many detailed items) and the scrollbar only ever appears
    // next to that middle section.
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px' }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
            <ChevronLeft size={22} />
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{purchaseId ? 'Редактирование' : 'Новая покупка'}</h1>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <ModeToggle mode={form.mode} onChange={(mode) => setForm({ ...form, mode })} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <DateField value={form.date} onChange={(date) => setForm({ ...form, date })} />
          <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>Сумма (уплачено)</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.totalPaid}
              onChange={(e) => setForm({ ...form, totalPaid: e.target.value })}
              placeholder="0"
              style={inputStyle}
            />
          </div>
        </div>

        <PlaceAutocomplete value={form.place} onChange={(place) => setForm({ ...form, place })} />

        {form.mode === 'quick' ? (
          <QuickForm categoryId={form.quickCategoryId} onChangeCategory={handleQuickCategoryChange} />
        ) : (
          <DetailedForm
            items={form.items}
            onChangeItems={(items) => setForm({ ...form, items })}
            totalPaid={form.totalPaid}
            quickCategoryId={form.quickCategoryId}
          />
        )}

        <TagPicker tagIds={form.tagIds} onChange={(tagIds) => setForm({ ...form, tagIds })} />

        <div>
          <label style={fieldLabelStyle}>Заметка</label>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: 16 }}>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: canSave ? 'var(--text)' : 'var(--surface-2)',
            color: canSave ? 'var(--bg)' : 'var(--text-faint)',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
      {[
        { value: 'quick', label: 'Быстро' },
        { value: 'detailed', label: 'Детально' },
      ].map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: mode === opt.value ? 'var(--surface-2)' : 'none',
            color: mode === opt.value ? 'var(--text)' : 'var(--text-muted)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
