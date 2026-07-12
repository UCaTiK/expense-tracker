import { Plus } from 'lucide-react';

export default function FabAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Добавить покупку"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        height: 52,
        border: 'none',
        borderTop: '0.5px solid var(--border)',
        background: 'var(--text)',
        color: 'var(--bg)',
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      <Plus size={18} />
      Добавить покупку
    </button>
  );
}
