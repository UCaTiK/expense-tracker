import { formatAmount } from '../../lib/format';

export default function SumMismatchWarning({ itemsSum, totalPaid, onUseItemsSum }) {
  const diff = Number(totalPaid || 0) - itemsSum;
  if (Math.abs(diff) < 0.01) return null;

  const isMore = diff > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-2)',
        border: '0.5px solid var(--accent-orange)',
        color: 'var(--accent-orange)',
        fontSize: 13,
        marginTop: 4,
      }}
    >
      <span>
        Сумма позиций {isMore ? 'меньше' : 'больше'} уплаченной на {formatAmount(Math.abs(diff))} ₽
      </span>
      {onUseItemsSum && (
        <button
          type="button"
          onClick={onUseItemsSum}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            color: 'var(--accent-orange)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Указать как уплачено
        </button>
      )}
    </div>
  );
}
