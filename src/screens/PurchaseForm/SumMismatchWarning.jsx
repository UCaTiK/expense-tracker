import { formatAmount } from '../../lib/format';

export default function SumMismatchWarning({ itemsSum, totalPaid }) {
  const diff = Number(totalPaid || 0) - itemsSum;
  if (Math.abs(diff) < 0.01) return null;

  const isMore = diff > 0;
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-2)',
        border: '0.5px solid var(--accent-orange)',
        color: 'var(--accent-orange)',
        fontSize: 13,
        marginTop: 4,
      }}
    >
      Сумма позиций {isMore ? 'меньше' : 'больше'} уплаченной на {formatAmount(Math.abs(diff))} ₽
    </div>
  );
}
