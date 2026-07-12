import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';

export default function PeriodNavigator({ label, onPrev, onNext, canGoPrev = true, canGoNext = true, children }) {
  const swipeHandlers = useSwipe(onNext, onPrev);

  return (
    <div {...swipeHandlers}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 12px' }}>
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          style={{ ...navButtonStyle, visibility: canGoPrev ? 'visible' : 'hidden' }}
          aria-label="Предыдущий период"
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{label}</span>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          style={{ ...navButtonStyle, visibility: canGoNext ? 'visible' : 'hidden' }}
          aria-label="Следующий период"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {children}
    </div>
  );
}

const navButtonStyle = {
  background: 'var(--surface)',
  border: 'none',
  borderRadius: '50%',
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text)',
};
