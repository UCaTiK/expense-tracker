import { ChevronLeft, ChevronRight } from 'lucide-react';
import Amount from '../../components/common/Amount';
import { formatMonthLabel } from '../../lib/format';

export default function MonthSummaryHeader({ anchorDate, total, onPrev, onNext, canGoPrev, canGoNext }) {
  return (
    <div style={{ flexShrink: 0, padding: '12px 16px 0' }}>
      <div
        style={{
          position: 'relative',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 10px',
        }}
      >
        {/* Left/right quarter-width tap zones (not a plain icon button) —
            the arrow glyph hugs the outer edge, but the whole quarter is
            clickable. The middle half stays free for the text and doesn't
            trigger navigation. */}
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Предыдущий месяц"
          style={{ ...quarterZoneStyle, left: 0, justifyContent: 'flex-start', visibility: canGoPrev ? 'visible' : 'hidden' }}
        >
          <ChevronLeft size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            {formatMonthLabel(anchorDate.getTime())}
          </div>
          <Amount value={total} size="lg" />
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Следующий месяц"
          style={{ ...quarterZoneStyle, right: 0, justifyContent: 'flex-end', visibility: canGoNext ? 'visible' : 'hidden' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

const quarterZoneStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '25%',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
};
