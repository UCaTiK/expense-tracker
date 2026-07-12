import { Plus } from 'lucide-react';

export default function FabAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Добавить покупку"
      style={{
        position: 'fixed',
        bottom: 22,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--text)',
        border: '4px solid var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        zIndex: 21,
      }}
    >
      <Plus size={26} color="var(--bg)" />
    </button>
  );
}
