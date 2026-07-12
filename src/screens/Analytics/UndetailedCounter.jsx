export default function UndetailedCounter({ count }) {
  if (!count) return null;
  return (
    <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '4px 0' }}>
      Не детализировано покупок: {count}
    </div>
  );
}
