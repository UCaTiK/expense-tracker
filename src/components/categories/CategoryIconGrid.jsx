import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';

export default function CategoryIconGrid({ categories, selectedId, onSelect }) {
  return (
    // minmax(0, 1fr), not bare 1fr: a bare 1fr track's automatic minimum is
    // its item's min-content size, so a long category name would still
    // widen that column unevenly even with ellipsis truncation on the text
    // itself — minmax(0, ...) forces all 4 columns to stay equal width.
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
      {(categories || []).map((cat) => {
        const Icon = getIconComponent(cat.icon);
        const isSelected = cat.id === selectedId;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '12px 4px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isSelected ? getCategoryColorVar(cat.color) : 'transparent'}`,
              background: 'var(--surface)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: getCategoryColorVar(cat.color),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={18} color="#121212" />
            </div>
            <span
              style={{
                fontSize: 12,
                lineHeight: '14px',
                height: 14,
                width: '100%',
                textAlign: 'center',
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
