import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import PlaceEditMenu from './PlaceEditMenu';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useCategoryMap } from '../../hooks/useCategories';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';
import { deletePlace } from '../../db/places';

export default function PlaceRow({ place }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const categoryMap = useCategoryMap();
  const category = categoryMap?.get(place.defaultCategoryId);
  const Icon = category ? getIconComponent(category.icon) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button
        onClick={() => setEditOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: 1,
          minWidth: 0,
          padding: '12px 8px 12px 16px',
          background: 'none',
          border: 'none',
          textAlign: 'left',
        }}
      >
        {Icon ? (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: getCategoryColorVar(category.color),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={13} color="#121212" />
          </div>
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '0.5px dashed var(--border)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{category ? category.name : 'Категория не задана'}</div>
        </div>
      </button>

      <button
        onClick={() => setConfirmOpen(true)}
        aria-label="Удалить место"
        style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '12px 16px', flexShrink: 0 }}
      >
        <Trash2 size={18} />
      </button>

      {editOpen && <PlaceEditMenu place={place} onClose={() => setEditOpen(false)} />}

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить место?"
        message="Место пропадёт из подсказок при вводе. Уже сохранённые покупки не изменятся."
        confirmLabel="Удалить"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await deletePlace(place.name);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
