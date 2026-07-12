export default function ConfirmDialog({ open, title, message, confirmLabel = 'Подтвердить', danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--surface)',
          borderRadius: '16px 16px 0 0',
          padding: 20,
          paddingBottom: 28,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
        {message && <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>{message}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)',
              border: 'none',
              color: 'var(--text)',
              fontSize: 15,
            }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: danger ? 'var(--danger)' : 'var(--text)',
              border: 'none',
              color: danger ? '#fff' : 'var(--bg)',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
