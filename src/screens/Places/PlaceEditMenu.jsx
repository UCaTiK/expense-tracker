import { useState } from 'react';
import CategoryIconGrid from '../../components/categories/CategoryIconGrid';
import { useTopLevelCategories } from '../../hooks/useCategories';
import { renamePlace, setPlaceCategory } from '../../db/places';
import { inputStyle } from '../../lib/formStyles';

export default function PlaceEditMenu({ place, onClose }) {
  const [name, setName] = useState(place.name);
  const categories = useTopLevelCategories();

  const saveName = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== place.name) {
      await renamePlace(place.name, trimmed);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--surface)',
          borderRadius: '16px 16px 0 0',
          padding: 20,
          paddingBottom: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Название</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Категория по умолчанию (для быстрого добавления)
          </label>
          <CategoryIconGrid
            categories={categories || []}
            selectedId={place.defaultCategoryId}
            onSelect={(categoryId) => setPlaceCategory(place.name, categoryId)}
          />
        </div>

        <button
          onClick={async () => {
            await saveName();
            onClose();
          }}
          style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 15, fontWeight: 600 }}
        >
          Готово
        </button>
      </div>
    </div>
  );
}
