import { useState } from 'react';
import { usePlaceSuggestions } from '../../hooks/usePlaces';
import { fieldLabelStyle, inputStyle } from '../../lib/formStyles';

export default function PlaceAutocomplete({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  const suggestions = usePlaceSuggestions(value);
  const showSuggestions = focused && value && suggestions.some((s) => s.name !== value);

  return (
    <div style={{ position: 'relative' }}>
      <label style={fieldLabelStyle}>Место</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Например, Пятёрочка"
        style={inputStyle}
      />
      {showSuggestions && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-sm)',
            marginTop: 4,
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s.name}
              onClick={() => onChange(s.name)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontSize: 14,
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
