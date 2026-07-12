import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { exportData, importData, getLastBackupAt } from '../../db/exportImport';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatShortDate } from '../../lib/format';
import { sectionStyle, sectionTitleStyle as titleStyle, rowButtonStyle } from '../../lib/formStyles';

export default function DataSection() {
  const fileInputRef = useRef(null);
  const [lastBackupAt, setLastBackupAt] = useState(getLastBackupAt());
  const [pendingImport, setPendingImport] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    const payload = await exportData();
    setLastBackupAt(payload.exportedAt);
  };

  const handleFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setPendingImport(json);
      setError(null);
    } catch {
      setError('Не удалось прочитать файл — это должен быть JSON-бэкап трекера трат.');
    }
  };

  const confirmImport = async () => {
    try {
      await importData(pendingImport);
      setPendingImport(null);
    } catch (err) {
      setError(err.message);
      setPendingImport(null);
    }
  };

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Данные</h2>
      <button onClick={handleExport} style={rowButtonStyle}>
        <Download size={17} /> Экспортировать JSON
      </button>
      <button onClick={() => fileInputRef.current?.click()} style={rowButtonStyle}>
        <Upload size={17} /> Импортировать JSON
      </button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChosen} style={{ display: 'none' }} />
      <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '8px 16px 4px' }}>
        {lastBackupAt ? `Последний бэкап: ${formatShortDate(new Date(lastBackupAt).getTime())}` : 'Бэкапов ещё не было'}
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', padding: '4px 16px' }}>{error}</div>}

      <ConfirmDialog
        open={Boolean(pendingImport)}
        title="Импортировать данные?"
        message="Все текущие данные будут заменены содержимым файла. Действие необратимо."
        confirmLabel="Импортировать"
        danger
        onCancel={() => setPendingImport(null)}
        onConfirm={confirmImport}
      />
    </section>
  );
}
