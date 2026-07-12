import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useCategoryMap } from './useCategories';
import {
  getComparisonRanges,
  aggregateByCategory,
  compareCategoryAggregates,
  getTotal,
  countUndetailedPurchases,
  hasInsufficientPreviousData,
  percentChange,
} from '../lib/analytics';

async function fetchRangeData(range) {
  const purchases = await db.purchases.where('date').between(range.start, range.end, true, false).toArray();
  const ids = purchases.map((p) => p.id);
  const items = ids.length ? await db.purchaseItems.where('purchaseId').anyOf(ids).toArray() : [];
  const itemsByPurchaseId = new Map();
  for (const item of items) {
    if (!itemsByPurchaseId.has(item.purchaseId)) itemsByPurchaseId.set(item.purchaseId, []);
    itemsByPurchaseId.get(item.purchaseId).push(item);
  }
  return { purchases, itemsByPurchaseId };
}

// Combines the pure date-range logic in lib/analytics.js with the two-step
// Dexie fetch (purchases in range -> their items) for both the current and
// comparison periods, then feeds the raw rows into the pure aggregation
// functions.
export function useAnalyticsData(periodType, anchorDate, mode) {
  const categoryMap = useCategoryMap();
  const today = useMemo(() => new Date(), []);
  const anchorTime = anchorDate.getTime();

  const ranges = useMemo(
    () => getComparisonRanges(periodType, new Date(anchorTime), mode, today),
    [periodType, anchorTime, mode, today],
  );

  const raw = useLiveQuery(async () => {
    const [current, previous] = await Promise.all([
      fetchRangeData(ranges.currentRange),
      fetchRangeData(ranges.previousRange),
    ]);
    return { current, previous };
  }, [ranges.currentRange.start, ranges.currentRange.end, ranges.previousRange.start, ranges.previousRange.end]);

  return useMemo(() => {
    if (!raw || !categoryMap) return null;
    const currentAgg = aggregateByCategory(raw.current.purchases, raw.current.itemsByPurchaseId, categoryMap);
    const previousAgg = aggregateByCategory(raw.previous.purchases, raw.previous.itemsByPurchaseId, categoryMap);
    const currentTotal = getTotal(raw.current.purchases);
    const previousTotal = getTotal(raw.previous.purchases);

    return {
      isOngoing: ranges.isOngoing,
      currentRange: ranges.currentRange,
      previousRange: ranges.previousRange,
      comparison: compareCategoryAggregates(currentAgg, previousAgg),
      currentTotal,
      previousTotal,
      totalChangePercent: percentChange(currentTotal, previousTotal),
      undetailedCount: countUndetailedPurchases(raw.current.purchases),
      insufficientPrevious: hasInsufficientPreviousData(raw.previous.purchases),
    };
  }, [raw, categoryMap, ranges]);
}
