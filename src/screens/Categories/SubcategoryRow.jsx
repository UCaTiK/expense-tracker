import { useState } from 'react';
import { GripVertical, MoreHorizontal } from 'lucide-react';
import CategoryEditMenu from './CategoryEditMenu';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';

// The circle's background always uses the parent category's color (a
// subcategory never has its own) — only the icon glyph is its own,
// independently editable, defaulting to the parent's at creation.
export default function SubcategoryRow({ category, parentColor, dragHandleProps }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = getIconComponent(category.icon);

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
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: getCategoryColorVar(parentColor),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={13} color="#121212" />
      </div>
      <span style={{ flex: 1, fontSize: 14 }}>{category.name}</span>
      {category.isArchived && (
        <span style={{ fontSize: 11, color: 'var(--text-faint)', border: '0.5px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>
          В архиве
        </span>
      )}
      <button
        {...dragHandleProps}
        aria-label="Изменить порядок"
        style={{ background: 'none', border: 'none', color: 'var(--text-faint)', padding: 4, touchAction: 'none', cursor: 'grab' }}
      >
        <GripVertical size={16} />
      </button>
      <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', padding: 4 }}>
        <MoreHorizontal size={18} />
      </button>
      {menuOpen && <CategoryEditMenu category={category} isTopLevel={false} onClose={() => setMenuOpen(false)} />}
    </div>
  );
}
