import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useTopLevelCategories, useSubcategories, useCategoryMap } from '../../hooks/useCategories';
import { resolveTopCategoryId } from '../../lib/categoryTree';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';
import { inputStyle } from '../../lib/formStyles';
import PickerModal from '../../components/common/PickerModal';

function CategoryOptionRow({ category, showArrow }) {
  const Icon = getIconComponent(category.icon);
  return (
    <>
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: getCategoryColorVar(category.color),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={13} color="#121212" />
      </span>
      <span style={{ flex: 1 }}>{category.name}</span>
      {showArrow && <ChevronRight size={16} color="var(--text-faint)" />}
    </>
  );
}

export default function PurchaseItemRow({ item, suggestedAmount, onChange, onRemove }) {
  const categoryMap = useCategoryMap();
  const topCategories = useTopLevelCategories() || [];
  const [openPicker, setOpenPicker] = useState(null); // null | 'category' | 'subcategory'
  // Once the amount field has been focused (or the item already had a real
  // amount to begin with), it's "touched" — the suggested remainder never
  // ghosts into it again, even if the user clears it back to empty.
  const [amountTouched, setAmountTouched] = useState(Boolean(item.amount));

  // item.subcategoryId may point at a genuine subcategory (has parentId) or
  // at a top-level category directly (parentId null — category chosen,
  // subcategory left unset). Either way it resolves to which top category
  // and which subcategory (if any) are currently selected.
  const selectedCategory = categoryMap?.get(item.subcategoryId);
  const selectedTopId = selectedCategory ? resolveTopCategoryId(selectedCategory) : '';
  const selectedSubId = selectedCategory && selectedCategory.parentId !== null ? selectedCategory.id : '';
  const subcategories = useSubcategories(selectedTopId || null) || [];

  const selectedTop = categoryMap?.get(selectedTopId);
  const selectedSub = categoryMap?.get(selectedSubId);

  const hasSubcategories = (topId) => {
    if (!categoryMap) return false;
    for (const cat of categoryMap.values()) {
      if (cat.parentId === topId && !cat.isArchived) return true;
    }
    return false;
  };

  // Picking a category always resets any previously chosen subcategory —
  // the subcategory is never set automatically, only by hand. If the newly
  // picked category has any subcategories, the subcategory picker opens
  // immediately after (chained, single field) — PickerModal only calls
  // onSelect, not onClose, so this transition isn't racing an auto-close.
  const pickCategory = (id) => {
    onChange({ ...item, subcategoryId: id });
    setOpenPicker(hasSubcategories(id) ? 'subcategory' : null);
  };

  const pickSubcategory = (id) => {
    onChange({ ...item, subcategoryId: id || selectedTopId });
    setOpenPicker(null);
  };

  // Shows the suggested remainder as a "ghost" value sitting right inside
  // the amount field itself (dashed border) instead of a separate hint —
  // it's not a real committed amount yet, just what's displayed. The first
  // focus commits a real "0" (solid border from then on) so typing starts
  // from an actual value rather than the ghosted suggestion.
  const showGhost = !amountTouched && !item.amount && suggestedAmount != null;
  const handleAmountFocus = (e) => {
    if (!showGhost) return;
    setAmountTouched(true);
    onChange({ ...item, amount: '0' });
    requestAnimationFrame(() => e.target.select());
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        padding: 10,
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
          placeholder="Название (необязательно)"
          style={{ ...inputStyle, flex: 1, minWidth: 0, padding: '10px 12px', fontSize: 14 }}
        />
        <input
          type="number"
          inputMode="decimal"
          value={showGhost ? suggestedAmount : item.amount}
          onFocus={handleAmountFocus}
          onChange={(e) => {
            setAmountTouched(true);
            onChange({ ...item, amount: e.target.value });
          }}
          placeholder="0"
          style={{
            ...inputStyle,
            width: 90,
            flexShrink: 0,
            padding: '10px 8px',
            fontSize: 14,
            textAlign: 'right',
            border: showGhost ? '1px dashed var(--border)' : inputStyle.border,
            color: showGhost ? 'var(--text-faint)' : 'var(--text)',
          }}
        />
        <button
          onClick={onRemove}
          aria-label="Удалить позицию"
          style={{ flexShrink: 0, padding: 8, background: 'none', border: 'none', color: 'var(--text-faint)' }}
        >
          <X size={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpenPicker('category')}
        style={{
          ...inputStyle,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          textAlign: 'left',
          color: selectedTop ? 'var(--text)' : 'var(--text-faint)',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedTop ? (selectedSub ? `${selectedTop.name} › ${selectedSub.name}` : selectedTop.name) : 'Категория'}
        </span>
        <ChevronRight size={16} color="var(--text-faint)" style={{ flexShrink: 0 }} />
      </button>

      {openPicker === 'category' && (
        <PickerModal
          title="Категория"
          options={topCategories}
          selectedId={selectedTopId}
          onSelect={pickCategory}
          onClose={() => setOpenPicker(null)}
          renderOption={(cat) => <CategoryOptionRow category={cat} showArrow={hasSubcategories(cat.id)} />}
        />
      )}

      {openPicker === 'subcategory' && (
        <PickerModal
          title="Подкатегория"
          options={[{ id: '', name: 'Без подкатегории' }, ...subcategories]}
          selectedId={selectedSubId}
          onSelect={pickSubcategory}
          onClose={() => setOpenPicker(null)}
          onBack={() => setOpenPicker('category')}
        />
      )}
    </div>
  );
}
