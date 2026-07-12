import Amount from '../../components/common/Amount';
import PurchaseListItem from './PurchaseListItem';
import { formatDayGroupLabel } from '../../lib/format';

export default function DayGroup({ dayTimestamp, purchases, itemsMap, categoryMap, tagMap, onSelectPurchase, isFirst }) {
  const subtotal = purchases.reduce((sum, p) => sum + p.totalPaid, 0);

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: isFirst ? '0 16px 4px' : '10px 16px 4px',
          fontSize: 12,
          color: 'var(--text-muted)',
          textTransform: 'capitalize',
        }}
      >
        <span>{formatDayGroupLabel(dayTimestamp)}</span>
        <Amount value={subtotal} size="sm" />
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', margin: '0 16px', overflow: 'hidden' }}>
        {purchases.map((p, i) => (
          <div key={p.id} style={{ borderTop: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
            <PurchaseListItem
              purchase={p}
              items={itemsMap.get(p.id) || []}
              categoryMap={categoryMap}
              tagMap={tagMap}
              onClick={() => onSelectPurchase(p.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
