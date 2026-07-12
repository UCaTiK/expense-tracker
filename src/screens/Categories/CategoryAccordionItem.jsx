import { useState } from 'react';
import { ChevronDown, MoreHorizontal, Plus } from 'lucide-react';
import SubcategoryRow from './SubcategoryRow';
import CategoryEditMenu from './CategoryEditMenu';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';
import { createCategory } from '../../db/categories';
import { inputStyle } from '../../lib/formStyles';

export default function CategoryAccordionItem({ category }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');

  const Icon = getIconComponent(category.icon);

  const submitNewSub = async () => {
    const trimmed = newSubName.trim();
    if (trimmed) await createCategory({ name: trimmed, parentId: category.id });
    setNewSubName('');
    setAddingSub(false);
  };

  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          opacity: category.isArchived ? 0.5 : 1,
        }}
      >
        <button onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, background: 'none', border: 'none', textAlign: 'left' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: getCategoryColorVar(category.color),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} color="#121212" />
          </div>
          <span style={{ flex: 1, fontSize: 15 }}>{category.name}</span>
          {category.isArchived && (
            <span style={{ fontSize: 11, color: 'var(--text-faint)', border: '0.5px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>
              В архиве
            </span>
          )}
          <ChevronDown size={18} style={{ transform: expanded ? 'rotate(180deg)' : 'none', color: 'var(--text-faint)' }} />
        </button>
        <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', padding: 4 }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {expanded && (
        <div style={{ paddingBottom: 8 }}>
          {category.subcategories.map((sub) => (
            <SubcategoryRow key={sub.id} category={sub} />
          ))}
          {addingSub ? (
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px 8px 48px' }}>
              <input
                autoFocus
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitNewSub()}
                onBlur={submitNewSub}
                placeholder="Название подкатегории"
                style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingSub(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px 8px 48px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13 }}
            >
              <Plus size={14} /> Добавить подкатегорию
            </button>
          )}
        </div>
      )}

      {menuOpen && <CategoryEditMenu category={category} isTopLevel onClose={() => setMenuOpen(false)} />}
    </div>
  );
}
