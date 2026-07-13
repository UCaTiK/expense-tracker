import { useState } from 'react';
import { Archive, ArchiveRestore } from 'lucide-react';
import IconPicker from '../../components/common/IconPicker';
import ColorPicker from '../../components/common/ColorPicker';
import { updateCategory, archiveCategory, restoreCategory } from '../../db/categories';
import { inputStyle } from '../../lib/formStyles';

export default function CategoryEditMenu({ category, isTopLevel, onClose }) {
  const [name, setName] = useState(category.name);

  const saveName = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== category.name) {
      await updateCategory(category.id, { name: trimmed });
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
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Иконка</label>
          <IconPicker value={category.icon} onSelect={(icon) => updateCategory(category.id, { icon })} />
        </div>

        {isTopLevel && (
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Цвет</label>
            <ColorPicker value={category.color} onSelect={(color) => updateCategory(category.id, { color })} />
          </div>
        )}

        <button
          onClick={async () => {
            await saveName();
            if (category.isArchived) await restoreCategory(category.id);
            else await archiveCategory(category.id);
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '0.5px solid var(--border)',
            background: 'var(--surface-2)',
            color: category.isArchived ? 'var(--text)' : 'var(--danger)',
            fontSize: 15,
          }}
        >
          {category.isArchived ? <ArchiveRestore size={17} /> : <Archive size={17} />}
          {category.isArchived
            ? 'Восстановить'
            : isTopLevel
              ? 'Архивировать (с подкатегориями)'
              : 'Архивировать'}
        </button>

        <button
          onClick={async () => {
            await saveName();
            onClose();
          }}
          style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 15, fontWeight: 600 }}
        >
          Готово
        </button>
      </div>
    </div>
  );
}
