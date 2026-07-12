import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import CategoryEditMenu from './CategoryEditMenu';

export default function SubcategoryRow({ category }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px 10px 48px',
        opacity: category.isArchived ? 0.5 : 1,
      }}
    >
      <span style={{ flex: 1, fontSize: 14 }}>{category.name}</span>
      {category.isArchived && (
        <span style={{ fontSize: 11, color: 'var(--text-faint)', border: '0.5px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>
          В архиве
        </span>
      )}
      <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', padding: 4 }}>
        <MoreHorizontal size={18} />
      </button>
      {menuOpen && <CategoryEditMenu category={category} isTopLevel={false} onClose={() => setMenuOpen(false)} />}
    </div>
  );
}
