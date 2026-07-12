import { useState } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import TagRow from './TagRow';
import EmptyState from '../../components/common/EmptyState';
import { Tag as TagIcon } from 'lucide-react';
import { useAllTags } from '../../hooks/useTags';
import { createTag } from '../../db/tags';
import { inputStyle } from '../../lib/formStyles';

export default function TagsScreen({ onBack }) {
  const tags = useAllTags();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const submitNewTag = async () => {
    const trimmed = newName.trim();
    if (trimmed) await createTag(trimmed);
    setNewName('');
    setAdding(false);
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Теги</h1>
      </div>

      {tags && tags.length > 0 && (
        <div style={{ background: 'var(--surface)', margin: '0 16px 16px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {tags.map((tag, i) => (
            <div key={tag.id} style={{ borderTop: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
              <TagRow tag={tag} />
            </div>
          ))}
        </div>
      )}

      {tags && tags.length === 0 && !adding && (
        <EmptyState icon={TagIcon} title="Тегов пока нет" subtitle="Добавьте первый тег ниже" />
      )}

      <div style={{ padding: '0 16px' }}>
        {adding ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitNewTag()}
            onBlur={submitNewTag}
            placeholder="Название тега"
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
            <Plus size={16} /> Новый тег
          </button>
        )}
      </div>
    </div>
  );
}
