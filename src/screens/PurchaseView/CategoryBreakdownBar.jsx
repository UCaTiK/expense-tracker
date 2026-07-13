import Amount from '../../components/common/Amount';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';

// Clicking a bar filters the item list below to just that category — tap
// the already-selected one again to clear (handled by the caller's toggle).
export default function CategoryBreakdownBar({ category, amount, percent, selected, onClick }) {
  const Icon = getIconComponent(category?.icon);
  const color = getCategoryColorVar(category?.color);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        marginBottom: 10,
        padding: 6,
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: selected ? 'var(--surface-2)' : 'none',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={15} color={color} />
          <span style={{ fontSize: 13, color: 'var(--text)' }}>{category?.name || 'Прочее'}</span>
        </div>
        <Amount value={amount} size="sm" />
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 3 }} />
      </div>
    </button>
  );
}
