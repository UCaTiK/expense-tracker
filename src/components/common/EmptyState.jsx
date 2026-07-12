export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
      {Icon && <Icon size={32} style={{ marginBottom: 12, opacity: 0.6 }} />}
      <div style={{ fontSize: 15, color: 'var(--text)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}
