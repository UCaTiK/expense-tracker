export default function InsufficientDataNotice() {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-2)',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}
    >
      Недостаточно данных для сравнения с предыдущим периодом
    </div>
  );
}
