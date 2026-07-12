import { useEffect, useMemo, useRef } from 'react';
import MonthSummaryHeader from './MonthSummaryHeader';
import DayGroup from './DayGroup';
import EmptyState from '../../components/common/EmptyState';
import { Receipt } from 'lucide-react';
import { useAllPurchases } from '../../hooks/usePurchases';
import { usePurchaseItemsByPurchaseIds } from '../../hooks/usePurchaseItems';
import { useCategoryMap } from '../../hooks/useCategories';
import { useAllTags } from '../../hooks/useTags';
import { useSwipe } from '../../hooks/useSwipe';
import { dateKey } from '../../lib/format';
import { getPeriodRange, shiftPeriod } from '../../lib/analytics';

export default function HomeScreen({ onSelectPurchase, monthAnchor, onMonthAnchorChange, scrollPositionRef }) {
  const purchases = useAllPurchases();
  const categoryMap = useCategoryMap();
  const tags = useAllTags();
  const tagMap = useMemo(() => new Map((tags || []).map((t) => [t.id, t])), [tags]);

  const { start, end } = useMemo(() => getPeriodRange('month', monthAnchor), [monthAnchor]);

  // Only this month's purchases are shown; the arrows only move to months
  // that actually have data, so browsing never lands on an empty screen.
  const monthPurchases = useMemo(
    () => (purchases || []).filter((p) => p.date >= start && p.date < end),
    [purchases, start, end],
  );
  const hasEarlier = useMemo(() => (purchases || []).some((p) => p.date < start), [purchases, start]);
  const hasLater = useMemo(() => (purchases || []).some((p) => p.date >= end), [purchases, end]);

  const purchaseIds = useMemo(() => monthPurchases.map((p) => p.id), [monthPurchases]);
  const itemsMap = usePurchaseItemsByPurchaseIds(purchaseIds);

  const monthTotal = useMemo(() => monthPurchases.reduce((sum, p) => sum + p.totalPaid, 0), [monthPurchases]);

  const dayGroups = useMemo(() => {
    const groups = [];
    const indexByKey = new Map();
    for (const p of monthPurchases) {
      const key = dateKey(p.date);
      if (!indexByKey.has(key)) {
        indexByKey.set(key, groups.length);
        groups.push({ key, dayTimestamp: p.date, purchases: [] });
      }
      groups[indexByKey.get(key)].purchases.push(p);
    }
    return groups;
  }, [monthPurchases]);

  // Returning to Home from a purchase (same month, e.g. the Back button)
  // restores wherever the user left off — handled by the callback ref
  // below, which fires exactly when the scrollable list mounts (including
  // after the data-loading gate opens). Any actual *change* of month —
  // whether via the arrows/swipe here, or externally (tapping the
  // "Главная" tab resets to the current month even if Home never
  // unmounts) — resets scroll to the top instead.
  const scrollNodeRef = useRef(null);
  const monthKey = monthAnchor.getTime();
  const prevMonthKeyRef = useRef(monthKey);
  useEffect(() => {
    if (monthKey === prevMonthKeyRef.current) return;
    prevMonthKeyRef.current = monthKey;
    if (scrollPositionRef) scrollPositionRef.current = 0;
    if (scrollNodeRef.current) scrollNodeRef.current.scrollTop = 0;
  }, [monthKey, scrollPositionRef]);

  const goPrev = () => hasEarlier && onMonthAnchorChange(shiftPeriod('month', monthAnchor, -1));
  const goNext = () => hasLater && onMonthAnchorChange(shiftPeriod('month', monthAnchor, 1));
  const swipeHandlers = useSwipe(goNext, goPrev);

  const attachScrollRef = (node) => {
    scrollNodeRef.current = node;
    if (node && scrollPositionRef) {
      node.scrollTop = scrollPositionRef.current;
    }
  };
  const handleScroll = (e) => {
    if (scrollPositionRef) scrollPositionRef.current = e.currentTarget.scrollTop;
  };

  if (!purchases || !categoryMap) {
    return null;
  }

  return (
    // Only the purchase list scrolls (flex:1 + overflowY:auto) — the total
    // stays a normal, non-scrolling flex sibling above it, so the scrollbar
    // only ever appears alongside the list, not the whole screen.
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <MonthSummaryHeader
        anchorDate={monthAnchor}
        total={monthTotal}
        onPrev={goPrev}
        onNext={goNext}
        canGoPrev={hasEarlier}
        canGoNext={hasLater}
      />
      <div
        ref={attachScrollRef}
        onScroll={handleScroll}
        {...swipeHandlers}
        style={{ flex: 1, overflowY: 'auto' }}
      >
        {dayGroups.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={purchases.length === 0 ? 'Пока нет покупок' : 'Нет покупок за этот месяц'}
            subtitle="Нажмите «+», чтобы добавить первую"
          />
        ) : (
          dayGroups.map((group, index) => (
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
        {/* Clears the fixed footer (add-purchase bar + gap + nav + bottom
            inset) without the container itself carrying padding — a
            flex-column child, not a CSS padding-bottom on the scrollable
            box. */}
        <div style={{ height: 133 }} />
      </div>
    </div>
  );
}
