const OPTIONS = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
];

export default function PeriodSwitcher({ value, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: value === opt.value ? 'var(--surface-2)' : 'none',
            color: value === opt.value ? 'var(--text)' : 'var(--text-muted)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
