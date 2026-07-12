import { useState, useMemo } from 'react';
import PeriodSwitcher from './PeriodSwitcher';
import PeriodNavigator from './PeriodNavigator';
import CategoryComparisonRow, { ChangeBadge } from './CategoryComparisonRow';
import InsufficientDataNotice from './InsufficientDataNotice';
import UndetailedCounter from './UndetailedCounter';
import EmptyState from '../../components/common/EmptyState';
import Amount from '../../components/common/Amount';
import { PieChart } from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useAllPurchases } from '../../hooks/usePurchases';
import { shiftPeriod, getPeriodLabel, getPeriodRange } from '../../lib/analytics';

const MODE_LABELS = {
  week: ['С начала недели', 'Вся неделя'],
  month: ['С начала месяца', 'Весь месяц'],
  year: ['С начала года', 'Весь год'],
};

export default function AnalyticsScreen({ onSelectCategory }) {
  const [periodType, setPeriodType] = useState('month');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [mode, setMode] = useState('toDate');

  const data = useAnalyticsData(periodType, anchorDate, mode);
  const label = useMemo(() => getPeriodLabel(periodType, anchorDate), [periodType, anchorDate]);

  // Prev/next only move to periods that actually have data somewhere beyond
  // them — using the full calendar period bounds (not the possibly-toDate-
  // truncated data.currentRange), so an empty period sandwiched between two
  // periods with data (e.g. a data-less February between January and July)
  // is still reachable, it just renders empty.
  const purchases = useAllPurchases();
  const { start, end } = useMemo(() => getPeriodRange(periodType, anchorDate), [periodType, anchorDate]);
  const hasEarlier = useMemo(() => (purchases || []).some((p) => p.date < start), [purchases, start]);
  const hasLater = useMemo(() => (purchases || []).some((p) => p.date >= end), [purchases, end]);

  const changePeriodType = (type) => {
    setPeriodType(type);
    setAnchorDate(new Date());
  };

  const goPrev = () => hasEarlier && setAnchorDate(shiftPeriod(periodType, anchorDate, -1));
  const goNext = () => hasLater && setAnchorDate(shiftPeriod(periodType, anchorDate, 1));

  const maxAmount = data ? Math.max(1, ...data.comparison.map((r) => r.amount)) : 1;
  const [toDateLabel, fullLabel] = MODE_LABELS[periodType];

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ fontSize: 20, margin: '0 0 12px' }}>Аналитика</h1>
        <PeriodSwitcher value={periodType} onChange={changePeriodType} />
      </div>

      <div style={{ padding: '0 16px' }}>
        <PeriodNavigator label={label} onPrev={goPrev} onNext={goNext} canGoPrev={hasEarlier} canGoNext={hasLater}>
          {!data ? null : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                <Amount value={data.currentTotal} size="lg" />
                {!data.insufficientPrevious && <ChangeBadge changePercent={data.totalChangePercent} />}
              </div>

              {data.isOngoing && (
                <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
                  {[
                    { value: 'toDate', label: toDateLabel },
                    { value: 'full', label: fullLabel },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: '0.5px solid var(--border)',
                        background: mode === opt.value ? 'var(--surface-2)' : 'none',
                        color: mode === opt.value ? 'var(--text)' : 'var(--text-muted)',
                        fontSize: 12,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {data.insufficientPrevious && <InsufficientDataNotice />}
              <UndetailedCounter count={data.undetailedCount} />

              <div style={{ marginTop: 20 }}>
                {data.comparison.length === 0 ? (
                  <EmptyState icon={PieChart} title="Нет покупок за этот период" />
                ) : (
                  data.comparison.map((row) => (
                    <CategoryComparisonRow
                      key={row.categoryId || 'none'}
                      row={row}
                      maxAmount={maxAmount}
                      onClick={row.categoryId ? () => onSelectCategory(row.categoryId, periodType, anchorDate) : undefined}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </PeriodNavigator>
      </div>
    </div>
  );
}
