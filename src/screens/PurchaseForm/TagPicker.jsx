import { useState } from 'react';
import TagChip from '../../components/common/TagChip';
import { useAllTags } from '../../hooks/useTags';
import { getOrCreateTag } from '../../db/tags';
import { fieldLabelStyle, inputStyle } from '../../lib/formStyles';

export default function TagPicker({ tagIds, onChange }) {
  const tags = useAllTags() || [];
  const [draft, setDraft] = useState('');

  const toggle = (id) => {
    onChange(tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id]);
  };

  const addNewTag = async () => {
    const name = draft.trim();
    if (!name) return;
    const tag = await getOrCreateTag(name);
    if (tag && !tagIds.includes(tag.id)) onChange([...tagIds, tag.id]);
    setDraft('');
  };

  return (
    <div>
      <label style={fieldLabelStyle}>Теги</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {tags.map((tag) => (
          <TagChip key={tag.id} label={tag.name} color={tag.color} selected={tagIds.includes(tag.id)} onClick={() => toggle(tag.id)} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addNewTag();
            }
          }}
          placeholder="Новый тег"
          style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
        />
        <button
          onClick={addNewTag}
          style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--surface-2)', color: 'var(--text)' }}
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
