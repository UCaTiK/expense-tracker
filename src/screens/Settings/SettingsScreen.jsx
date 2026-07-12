import DataSection from './DataSection';
import StorageSection from './StorageSection';
import ManagementSection from './ManagementSection';
import DangerZoneSection from './DangerZoneSection';

export default function SettingsScreen({ onOpenTags, onOpenPlaces }) {
  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Настройки</h1>
      </div>
      <DataSection />
      <ManagementSection onOpenTags={onOpenTags} onOpenPlaces={onOpenPlaces} />
      <StorageSection />
      <DangerZoneSection />
    </div>
  );
}
