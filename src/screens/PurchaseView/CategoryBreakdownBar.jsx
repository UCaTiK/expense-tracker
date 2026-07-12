import Amount from '../../components/common/Amount';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';

export default function CategoryBreakdownBar({ category, amount, percent }) {
  const Icon = getIconComponent(category?.icon);
  const color = getCategoryColorVar(category?.color);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={15} color={color} />
          <span style={{ fontSize: 13 }}>{category?.name || 'Прочее'}</span>
        </div>
        <Amount value={amount} size="sm" />
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}
