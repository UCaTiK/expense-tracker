import TagChip from '../../components/common/TagChip';
import { useAllTags } from '../../hooks/useTags';
import { fieldLabelStyle } from '../../lib/formStyles';

export default function TagPicker({ tagIds, onChange }) {
  const tags = useAllTags() || [];

  const toggle = (id) => {
    onChange(tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id]);
  };

  return (
    <div>
      <label style={fieldLabelStyle}>Теги</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((tag) => (
          <TagChip key={tag.id} label={tag.name} color={tag.color} selected={tagIds.includes(tag.id)} onClick={() => toggle(tag.id)} />
        ))}
      </div>
    </div>
  );
}
