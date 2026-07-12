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
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        background: 'var(--surface)',
        borderTop: '0.5px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 20,
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
        padding: '10px 0 8px',
        background: 'none',
        border: 'none',
        color: active ? 'var(--text)' : 'var(--text-faint)',
      }}
    >
      <Icon size={22} />
      <span style={{ fontSize: 11 }}>{tab.label}</span>
    </button>
  );
}
