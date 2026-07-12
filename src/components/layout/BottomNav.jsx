import { Home, BarChart3, Settings } from 'lucide-react';

const TABS = [
  { screen: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { screen: 'home', label: 'Главная', icon: Home },
  { screen: 'settings', label: 'Настройки', icon: Settings },
];

export default function BottomNav({ current, onNavigate }) {
  return (
    <nav
      style={{
        display: 'flex',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-sm)',
        padding: 3,
      }}
    >
      {TABS.map((tab) => (
        <NavButton key={tab.screen} tab={tab} active={current === tab.screen} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function NavButton({ tab, active, onNavigate }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={() => onNavigate(tab.screen)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: '8px 0',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--surface-2)' : 'none',
        border: 'none',
        color: active ? 'var(--text)' : 'var(--text-faint)',
      }}
    >
      <Icon size={22} />
      <span style={{ fontSize: 11 }}>{tab.label}</span>
    </button>
  );
}
