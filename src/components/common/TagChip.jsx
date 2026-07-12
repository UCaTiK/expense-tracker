import { getCategoryColorVar } from '../../lib/colors';

export default function TagChip({ label, color, onRemove, selected, onClick, size = 'md' }) {
  const isSmall = size === 'sm';
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 4 : 6,
        padding: isSmall ? '1px 8px' : '4px 10px',
        borderRadius: 999,
        fontSize: isSmall ? 11 : 13,
        background: selected ? 'var(--surface-2)' : 'transparent',
        border: '0.5px solid var(--border)',
        color: selected ? 'var(--text)' : 'var(--text-muted)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {color && (
        <span
          aria-hidden
          style={{
            width: isSmall ? 6 : 7,
            height: isSmall ? 6 : 7,
            borderRadius: '50%',
            background: getCategoryColorVar(color),
            flexShrink: 0,
          }}
        />
      )}
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontSize: isSmall ? 11 : 13, lineHeight: 1 }}
        >
          ×
        </button>
      )}
    </span>
  );
}
