import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, Receipt } from 'lucide-react';
import PeriodSwitcher from './PeriodSwitcher';
import PeriodNavigator from './PeriodNavigator';
import Amount from '../../components/common/Amount';
import EmptyState from '../../components/common/EmptyState';
import DayGroup from '../Home/DayGroup';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';
import { useCategoryMap } from '../../hooks/useCategories';
import { useAllTags } from '../../hooks/useTags';
import { useCategoryAnalyticsData, useCategoryPurchaseDates } from '../../hooks/useCategoryAnalyticsData';
import { shiftPeriod, getPeriodLabel, getPeriodRange } from '../../lib/analytics';

export default function CategoryDetailScreen({ categoryId, initialPeriodType, initialAnchorDate, onBack, onSelectPurchase }) {
  const [periodType, setPeriodType] = useState(initialPeriodType || 'month');
  const [anchorDate, setAnchorDate] = useState(() => new Date(initialAnchorDate || Date.now()));
  const [breakdownExpanded, setBreakdownExpanded] = useState(true);

  const categoryMap = useCategoryMap();
  const category = categoryMap?.get(categoryId);
  const tags = useAllTags();
  const tagMap = useMemo(() => new Map((tags || []).map((t) => [t.id, t])), [tags]);

  const data = useCategoryAnalyticsData(categoryId, periodType, anchorDate);
  const label = useMemo(() => getPeriodLabel(periodType, anchorDate), [periodType, anchorDate]);

  // Same "only navigate where there's data" rule as Analytics, scoped to
  // this category specifically rather than all purchases.
  const categoryDates = useCategoryPurchaseDates(categoryId);
  const { start, end } = useMemo(() => getPeriodRange(periodType, anchorDate), [periodType, anchorDate]);
  const hasEarlier = useMemo(() => categoryDates.some((d) => d < start), [categoryDates, start]);
  const hasLater = useMemo(() => categoryDates.some((d) => d >= end), [categoryDates, end]);

  const changePeriodType = (type) => {
    setPeriodType(type);
    setAnchorDate(new Date());
  };
  const goPrev = () => hasEarlier && setAnchorDate(shiftPeriod(periodType, anchorDate, -1));
  const goNext = () => hasLater && setAnchorDate(shiftPeriod(periodType, anchorDate, 1));

  const itemsMap = data?.itemsByPurchaseId || new Map();
  const maxSubAmount = data ? Math.max(1, ...data.subcategoryBreakdown.map((r) => r.amount)) : 1;

  const Icon = getIconComponent(category?.icon);
  const color = getCategoryColorVar(category?.color);

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
          <ChevronLeft size={22} />
        </button>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={13} color="#121212" />
        </div>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{category?.name || 'Категория'}</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <PeriodSwitcher value={periodType} onChange={changePeriodType} />
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <PeriodNavigator label={label} onPrev={goPrev} onNext={goNext} canGoPrev={hasEarlier} canGoNext={hasLater}>
          {!data ? null : (
            <>
              <Amount value={data.total} size="lg" />

              {data.subcategoryBreakdown.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={() => setBreakdownExpanded((v) => !v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      padding: '0 0 10px',
                    }}
                  >
                    Подкатегории
                    <ChevronDown size={16} style={{ transform: breakdownExpanded ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {breakdownExpanded && (
                    <div>
                      {data.subcategoryBreakdown.map((row) => (
                        <SubcategoryBreakdownRow
                          key={row.subcategoryId || 'none'}
                          row={row}
                          maxAmount={maxSubAmount}
                          color={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </PeriodNavigator>
      </div>

      <div style={{ marginTop: 12 }}>
        {!data ? null : data.dayGroups.length === 0 ? (
          <EmptyState icon={Receipt} title="Нет покупок за этот период" />
        ) : (
          data.dayGroups.map((group, index) => (
            <DayGroup
              key={group.key}
              dayTimestamp={group.dayTimestamp}
              purchases={group.purchases}
              itemsMap={itemsMap}
              categoryMap={categoryMap}
              tagMap={tagMap}
              onSelectPurchase={onSelectPurchase}
              isFirst={index === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SubcategoryBreakdownRow({ row, maxAmount, color }) {
  const percentOfMax = maxAmount > 0 ? (row.amount / maxAmount) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>{row.subcategory?.name || 'Без подкатегории'}</span>
        <Amount value={row.amount} size="sm" />
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentOfMax}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}
