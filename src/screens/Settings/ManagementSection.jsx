import { ChevronRight, Tag, MapPin, Wallet } from 'lucide-react';
import { sectionStyle, sectionTitleStyle, rowButtonStyle } from '../../lib/formStyles';

export default function ManagementSection({ onOpenTags, onOpenPlaces }) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Управление</h2>

      <button onClick={onOpenTags} style={rowButtonStyle}>
        <Tag size={17} />
        <span style={{ flex: 1 }}>Теги</span>
        <ChevronRight size={16} color="var(--text-faint)" />
      </button>

      <button onClick={onOpenPlaces} style={rowButtonStyle}>
        <MapPin size={17} />
        <span style={{ flex: 1 }}>Места</span>
        <ChevronRight size={16} color="var(--text-faint)" />
      </button>

      <div style={{ ...rowButtonStyle, color: 'var(--text-muted)' }}>
        <Wallet size={17} />
        <span style={{ flex: 1 }}>Счета</span>
        <span style={{ fontSize: 11, border: '0.5px solid var(--border)', borderRadius: 999, padding: '2px 8px', color: 'var(--text-faint)' }}>
          скоро
        </span>
      </div>
    </section>
  );
}
