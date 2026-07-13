import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PurchaseItemRow from './PurchaseItemRow';
import SumMismatchWarning from './SumMismatchWarning';
import { generateId } from '../../lib/uuid';
import { fieldLabelStyle } from '../../lib/formStyles';
import { useCategoryMap } from '../../hooks/useCategories';
import { resolveTopCategoryId } from '../../lib/categoryTree';

// A new item's top-level category defaults to whichever category is already
// most common among this purchase's existing items (ties broken by
// first-seen order) — never the exact subcategory, which is always picked
// by hand. With no items yet — e.g. switching from Quick to Detailed before
// adding anything, or editing a purchase that was originally quick — it
// falls back to that quick-mode category instead.
function getDefaultCategoryForNewItem(items, categoryMap, quickCategoryId) {
  const existingTopIds = items
    .map((it) => resolveTopCategoryId(categoryMap.get(it.subcategoryId)))
    .filter(Boolean);
  if (existingTopIds.length === 0) return quickCategoryId || null;

  const counts = new Map();
  for (const id of existingTopIds) counts.set(id, (counts.get(id) || 0) + 1);
  let best = existingTopIds[0];
  let bestCount = 0;
  for (const id of existingTopIds) {
    const count = counts.get(id);
    if (count > bestCount) {
      best = id;
      bestCount = count;
    }
  }
  return best;
}

export default function DetailedForm({ items, onChangeItems, totalPaid, onChangeTotalPaid, quickCategoryId }) {
  const categoryMap = useCategoryMap();
  // Ids of items whose amount is still just the auto-suggested remainder,
  // not yet confirmed by the user touching the field. The amount itself is
  // real data from the moment the item is created (counted in itemsSum,
  // saved like any other value) — this set only drives the "still just a
  // suggestion" dashed-border display in PurchaseItemRow, and is cleared
  // the moment that field is focused.
  const [suggestedIds, setSuggestedIds] = useState(() => new Set());

  const addItem = () => {
    const subcategoryId = getDefaultCategoryForNewItem(items, categoryMap || new Map(), quickCategoryId);
    const existingSum = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const remaining = Math.round((Number(totalPaid || 0) - existingSum) * 100) / 100;
    const id = generateId();
    const amount = remaining > 0 ? String(remaining) : '';
    // Marked unconfirmed even when it starts out empty (e.g. the total
    // hasn't been typed yet) — see the sync effect below, which needs to
    // recognize this item as still "open to follow the total" either way.
    setSuggestedIds((prev) => new Set(prev).add(id));
    onChangeItems([...items, { id, name: '', subcategoryId, amount }]);
  };

  // If there's exactly one item and it's still unconfirmed, its amount has
  // no other reasonable value than "the whole total" — so it keeps
  // following totalPaid live (e.g. total typed as 0, one item added, then
  // the total gets filled in afterwards) until the user actually touches
  // the field themselves, which is the only thing that confirms it.
  useEffect(() => {
    if (items.length !== 1) return;
    const [only] = items;
    if (!suggestedIds.has(only.id)) return;
    const synced = Number(totalPaid) > 0 ? String(Number(totalPaid)) : '';
    if (only.amount !== synced) onChangeItems([{ ...only, amount: synced }]);
    // Deliberately keyed only on totalPaid — items/suggestedIds are read
    // fresh from this render's closure, but shouldn't themselves retrigger
    // this sync (that would fight the user's own edits to the field).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPaid]);

  const confirmAmount = (id) => {
    setSuggestedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateItem = (index, next) => {
    const copy = items.slice();
    copy[index] = next;
    onChangeItems(copy);
  };

  const removeItem = (index) => {
    const removed = items[index];
    onChangeItems(items.filter((_, i) => i !== index));
    if (removed) confirmAmount(removed.id);
  };

  const itemsSum = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  return (
    <div>
      <label style={fieldLabelStyle}>Позиции</label>
      {items.map((item, i) => (
        <PurchaseItemRow
          key={item.id}
          item={item}
          isAmountSuggested={suggestedIds.has(item.id)}
          onConfirmAmount={() => confirmAmount(item.id)}
          onChange={(next) => updateItem(i, next)}
          onRemove={() => removeItem(i)}
        />
      ))}
      <button
        onClick={addItem}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '0.5px dashed var(--border)',
          background: 'none',
          color: 'var(--text-muted)',
          fontSize: 14,
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <Plus size={16} /> Добавить позицию
      </button>
      {items.length > 0 && (
        <SumMismatchWarning
          itemsSum={itemsSum}
          totalPaid={totalPaid}
          onUseItemsSum={onChangeTotalPaid ? () => onChangeTotalPaid(String(itemsSum)) : undefined}
        />
      )}
    </div>
  );
}
