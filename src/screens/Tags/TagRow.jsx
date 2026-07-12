import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import TagEditMenu from './TagEditMenu';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getCategoryColorVar } from '../../lib/colors';
import { deleteTag } from '../../db/tags';

export default function TagRow({ tag }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: getCategoryColorVar(tag.color), flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag.name}</span>
      </button>

      <button
        onClick={() => setConfirmOpen(true)}
        aria-label="Удалить тег"
        style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '12px 16px', flexShrink: 0 }}
      >
        <Trash2 size={18} />
      </button>

      {editOpen && <TagEditMenu tag={tag} onClose={() => setEditOpen(false)} />}

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить тег?"
        message="Тег будет убран со всех покупок, где он использовался."
        confirmLabel="Удалить"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await deleteTag(tag.id);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
