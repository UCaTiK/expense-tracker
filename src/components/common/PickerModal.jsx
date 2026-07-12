// Centered, semi-transparent modal for picking one option from a list —
// used where a native <select> dropdown would feel too plain (e.g. the
// category/subcategory pickers), unlike the bottom-sheet style used by
// ConfirmDialog/edit menus elsewhere in the app.
export default function PickerModal({ title, options, selectedId, onSelect, onClose, renderOption }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 320,
          maxHeight: '70vh',
          overflowY: 'auto',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 10,
        }}
      >
        {title && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 10px 10px' }}>{title}</div>
        )}
        {options.map((opt) => {
          const selected = opt.id === selectedId;
          return (
            <button
              key={opt.id}
              onClick={() => {
                onSelect(opt.id);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selected ? 'var(--surface-2)' : 'none',
                color: 'var(--text)',
                fontSize: 14,
                textAlign: 'left',
              }}
            >
              {renderOption ? renderOption(opt) : opt.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
