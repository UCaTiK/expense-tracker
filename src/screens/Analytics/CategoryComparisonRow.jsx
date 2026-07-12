import { TrendingUp, TrendingDown } from 'lucide-react';
import Amount from '../../components/common/Amount';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';

export default function CategoryComparisonRow({ row, maxAmount, onClick }) {
  const Icon = getIconComponent(row.category?.icon);
  const color = getCategoryColorVar(row.category?.color);
  const percentOfMax = maxAmount > 0 ? (row.amount / maxAmount) * 100 : 0;
  const clickable = Boolean(onClick && row.categoryId);

  return (
    <button
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      style={{
        display: 'block',
        width: '100%',
        marginBottom: 14,
        background: 'none',
        border: 'none',
        padding: 0,
        textAlign: 'left',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={15} color={color} />
          <span style={{ fontSize: 14, color: 'var(--text)' }}>{row.category?.name || 'Без категории'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChangeBadge changePercent={row.changePercent} />
          <Amount value={row.amount} size="sm" />
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentOfMax}%`, background: color, borderRadius: 3 }} />
      </div>
    </button>
  );
}

export function ChangeBadge({ changePercent }) {
  if (changePercent === null || changePercent === undefined) {
    return <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>новое</span>;
  }
  if (changePercent === 0) {
    return <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>0%</span>;
  }
  const isUp = changePercent > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? 'var(--danger)' : 'var(--accent-green)';
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color }}>
      <Icon size={12} />
      {Math.abs(changePercent).toFixed(0)}%
    </span>
  );
}
