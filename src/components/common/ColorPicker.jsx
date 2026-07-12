import { CATEGORY_COLORS, getCategoryColorVar } from '../../lib/colors';

export default function ColorPicker({ value, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {CATEGORY_COLORS.map((color) => {
        const selected = color === value;
        return (
          <button
            key={color}
            onClick={() => onSelect(color)}
            aria-label={color}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: getCategoryColorVar(color),
              border: selected ? '2px solid var(--text)' : '2px solid transparent',
              padding: 0,
            }}
          />
        );
      })}
    </div>
  );
}
