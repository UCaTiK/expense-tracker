import { ICON_NAMES, getIconComponent } from '../../lib/icons';

export default function IconPicker({ value, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
      {ICON_NAMES.map((name) => {
        const Icon = getIconComponent(name);
        const selected = name === value;
        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: selected ? '1.5px solid var(--text)' : '0.5px solid var(--border)',
              background: 'var(--surface-2)',
            }}
          >
            <Icon size={16} color="var(--text)" />
          </button>
        );
      })}
    </div>
  );
}
