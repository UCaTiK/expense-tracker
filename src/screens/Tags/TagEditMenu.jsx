import { useState } from 'react';
import ColorPicker from '../../components/common/ColorPicker';
import { updateTag } from '../../db/tags';
import { inputStyle } from '../../lib/formStyles';

export default function TagEditMenu({ tag, onClose }) {
  const [name, setName] = useState(tag.name);

  const saveName = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== tag.name) {
      await updateTag(tag.id, { name: trimmed });
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--surface)',
          borderRadius: '16px 16px 0 0',
          padding: 20,
          paddingBottom: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Название</label>
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Цвет</label>
          <ColorPicker value={tag.color} onSelect={(color) => updateTag(tag.id, { color })} />
        </div>

        <button
          onClick={async () => {
            await saveName();
            onClose();
          }}
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--text)',
            color: 'var(--bg)',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Готово
        </button>
      </div>
    </div>
  );
}
