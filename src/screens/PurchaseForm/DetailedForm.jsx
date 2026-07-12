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

  // A new item's amount defaults to whatever is left of the stated total
  // once the existing items' amounts are subtracted — for the first item
  // (nothing to subtract yet) that's the whole total, so a single-item
  // purchase can be detailed without retyping the amount.
  const addItem = () => {
    const subcategoryId = getDefaultCategoryForNewItem(items, categoryMap || new Map(), quickCategoryId);
    const existingSum = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const remaining = Math.round((Number(totalPaid || 0) - existingSum) * 100) / 100;
    const amount = remaining > 0 ? String(remaining) : '';
    onChangeItems([...items, { id: generateId(), name: '', subcategoryId, amount }]);
  };

  const updateItem = (index, next) => {
    const copy = items.slice();
    copy[index] = next;
    onChangeItems(copy);
  };

  const removeItem = (index) => {
    onChangeItems(items.filter((_, i) => i !== index));
  };

  const itemsSum = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  return (
    <div>
      <label style={fieldLabelStyle}>Позиции</label>
      {items.map((item, i) => (
        <PurchaseItemRow key={item.id} item={item} onChange={(next) => updateItem(i, next)} onRemove={() => removeItem(i)} />
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
