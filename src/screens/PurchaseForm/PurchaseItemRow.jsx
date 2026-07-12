import { useState } from 'react';
import { X } from 'lucide-react';
import { useTopLevelCategories, useSubcategories, useCategoryMap } from '../../hooks/useCategories';
import { resolveTopCategoryId } from '../../lib/categoryTree';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';
import { inputStyle } from '../../lib/formStyles';
import { formatAmount } from '../../lib/format';
import PickerModal from '../../components/common/PickerModal';

function CategoryOptionRow({ category }) {
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
      <span>{category.name}</span>
    </>
  );
}

export default function PurchaseItemRow({ item, suggestedAmount, onChange, onRemove }) {
  const categoryMap = useCategoryMap();
  const topCategories = useTopLevelCategories() || [];
  const [openPicker, setOpenPicker] = useState(null); // null | 'category' | 'subcategory'

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

  // Picking a category always resets any previously chosen subcategory —
  // the subcategory is never set automatically, only by hand.
  const pickCategory = (id) => {
    onChange({ ...item, subcategoryId: id });
  };

  const pickSubcategory = (id) => {
    onChange({ ...item, subcategoryId: id || selectedTopId });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        padding: 10,
        marginBottom: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={item.name}
            onChange={(e) => onChange({ ...item, name: e.target.value })}
            placeholder="Название (необязательно)"
            style={{ ...inputStyle, flex: 1, minWidth: 0, padding: '10px 12px', fontSize: 14 }}
          />
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <input
              type="number"
              inputMode="decimal"
              value={item.amount}
              onChange={(e) => onChange({ ...item, amount: e.target.value })}
              placeholder="0"
              style={{ ...inputStyle, width: 84, padding: '10px 8px', fontSize: 14 }}
            />
            {!item.amount && suggestedAmount != null && (
              <button
                type="button"
                onClick={() => onChange({ ...item, amount: String(suggestedAmount) })}
                style={{
                  marginTop: 3,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 11,
                  color: 'var(--text-faint)',
                  textDecoration: 'underline',
                }}
              >
                {formatAmount(suggestedAmount)} ₽
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setOpenPicker('category')}
            style={{
              ...inputStyle,
              flex: 1,
              minWidth: 0,
              padding: '10px 12px',
              fontSize: 14,
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: selectedTop ? 'var(--text)' : 'var(--text-faint)',
            }}
          >
            {selectedTop?.name || 'Категория'}
          </button>
          <button
            type="button"
            disabled={!selectedTopId}
            onClick={() => setOpenPicker('subcategory')}
            style={{
              ...inputStyle,
              flex: 1,
              minWidth: 0,
              padding: '10px 12px',
              fontSize: 14,
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              opacity: selectedTopId ? 1 : 0.4,
              color: selectedSub ? 'var(--text)' : 'var(--text-faint)',
            }}
          >
            {selectedSub?.name || 'Подкатегория'}
          </button>
        </div>
      </div>

      <button
        onClick={onRemove}
        aria-label="Удалить позицию"
        style={{
          alignSelf: 'center',
          flexShrink: 0,
          padding: 8,
          background: 'none',
          border: 'none',
          color: 'var(--text-faint)',
        }}
      >
        <X size={18} />
      </button>

      {openPicker === 'category' && (
        <PickerModal
          title="Категория"
          options={topCategories}
          selectedId={selectedTopId}
          onSelect={pickCategory}
          onClose={() => setOpenPicker(null)}
          renderOption={(cat) => <CategoryOptionRow category={cat} />}
        />
      )}

      {openPicker === 'subcategory' && (
        <PickerModal
          title="Подкатегория"
          options={[{ id: '', name: 'Без подкатегории' }, ...subcategories]}
          selectedId={selectedSubId}
          onSelect={pickSubcategory}
          onClose={() => setOpenPicker(null)}
        />
      )}
    </div>
  );
}
