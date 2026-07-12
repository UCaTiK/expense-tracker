import { useState } from 'react';
import { Plus } from 'lucide-react';
import CategoryAccordionItem from './CategoryAccordionItem';
import { useCategoryTree } from '../../hooks/useCategories';
import { createCategory } from '../../db/categories';
import { inputStyle } from '../../lib/formStyles';

export default function CategoriesScreen() {
  const tree = useCategoryTree({ includeArchived: true });
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const submitNewTop = async () => {
    const trimmed = newName.trim();
    if (trimmed) await createCategory({ name: trimmed, parentId: null });
    setNewName('');
    setAdding(false);
  };

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Категории</h1>
      </div>

      <div style={{ background: 'var(--surface)', margin: '0 16px 16px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {(tree || []).map((cat) => (
          <CategoryAccordionItem key={cat.id} category={cat} />
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {adding ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitNewTop()}
            onBlur={submitNewTop}
            placeholder="Название категории"
            style={inputStyle}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '0.5px dashed var(--border)',
              background: 'none',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            <Plus size={16} /> Новая категория
          </button>
        )}
      </div>
    </div>
  );
}
