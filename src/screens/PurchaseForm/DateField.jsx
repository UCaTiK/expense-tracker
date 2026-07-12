import { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { toDateInputValue, fromDateInputValue, formatDateDDMMYYYY } from '../../lib/format';
import { fieldLabelStyle, inputStyle } from '../../lib/formStyles';

// Shows a compact dd.mm.yyyy label instead of the browser/locale-dependent
// native date input display, while still using the native input (hidden)
// for its picker UI and value handling — showPicker() opens it on tap.
export default function DateField({ value, onChange }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    if (input.showPicker) input.showPicker();
    else input.click();
  };

  return (
    <div>
      <label style={fieldLabelStyle}>Дата</label>
      <button
        type="button"
        onClick={openPicker}
        style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', width: 'auto' }}
      >
        <Calendar size={16} color="var(--text-faint)" />
        {formatDateDDMMYYYY(value)}
      </button>
      <input
        ref={inputRef}
        type="date"
        value={toDateInputValue(value)}
        onChange={(e) => onChange(fromDateInputValue(e.target.value))}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
      />
    </div>
  );
}
