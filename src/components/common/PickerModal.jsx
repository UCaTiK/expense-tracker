import { ChevronLeft } from 'lucide-react';

// Centered, semi-transparent modal for picking one option from a list —
// used where a native <select> dropdown would feel too plain (e.g. the
// category/subcategory pickers), unlike the bottom-sheet style used by
// ConfirmDialog/edit menus elsewhere in the app.
//
// Selecting an option only calls `onSelect` — it does NOT also call
// `onClose` itself, so a caller can chain straight into showing another
// picker (e.g. category -> subcategory) from inside `onSelect` without a
// race against an automatic close. Tapping the backdrop still calls
// `onClose` directly, for dismissing without picking anything.
//
// `onBack`, if given, renders a back arrow next to the title that returns
// to whatever picker chained into this one (e.g. subcategory -> category),
// instead of dismissing the whole picker flow.
export default function PickerModal({ title, options, selectedId, onSelect, onClose, onBack, renderOption }) {
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
        {(title || onBack) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 4px 10px' }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Назад"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 6, display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {title && <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: onBack ? '0' : '4px 6px' }}>{title}</div>}
          </div>
        )}
        {options.map((opt) => {
          const selected = opt.id === selectedId;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
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
