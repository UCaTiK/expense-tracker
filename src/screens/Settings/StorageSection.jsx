import { useStorageStats } from '../../hooks/useStorageStats';
import { sectionStyle, sectionTitleStyle } from '../../lib/formStyles';
import { formatBytes } from '../../lib/format';

export default function StorageSection() {
  const stats = useStorageStats();

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Хранилище</h2>
      <div style={{ padding: '4px 16px 12px', fontSize: 14, color: 'var(--text-muted)' }}>
        <div>Покупок сохранено: {stats ? stats.purchases : '…'}</div>
        <div>Размер данных в базе: {stats ? formatBytes(stats.bytesUsed) : '…'}</div>
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-faint)' }}>
          Данные хранятся локально в этом браузере (IndexedDB), синхронизация не выполняется.
        </div>
      </div>
    </section>
  );
}
