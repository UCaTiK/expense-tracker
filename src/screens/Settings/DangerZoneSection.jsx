import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { clearAllData } from '../../db/exportImport';
import { sectionStyle, sectionTitleStyle, rowButtonStyle } from '../../lib/formStyles';

export default function DangerZoneSection() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Опасная зона</h2>
      <button onClick={() => setConfirmOpen(true)} style={{ ...rowButtonStyle, color: 'var(--danger)' }}>
        <Trash2 size={17} /> Очистить все данные
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Очистить все данные?"
        message="Все покупки, категории, теги и места будут удалены безвозвратно. Категории по умолчанию будут созданы заново."
        confirmLabel="Очистить"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await clearAllData();
          setConfirmOpen(false);
        }}
      />
    </section>
  );
}
