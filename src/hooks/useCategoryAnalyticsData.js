import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useCategoryMap } from './useCategories';
import { getPeriodRange, aggregateBySubcategory, filterPurchasesByCategory, groupPurchasesByDay } from '../lib/analytics';

// Single-category counterpart to useAnalyticsData — same two-step Dexie
// fetch (purchases in range -> their items), but scoped to one top-level
// category's subcategory breakdown and purchase list instead of a
// category-vs-category comparison.
export function useCategoryAnalyticsData(categoryId, periodType, anchorDate) {
  const categoryMap = useCategoryMap();
  const { start, end } = useMemo(() => getPeriodRange(periodType, anchorDate), [periodType, anchorDate]);

  const raw = useLiveQuery(async () => {
    const purchases = await db.purchases.where('date').between(start, end, true, false).toArray();
    const ids = purchases.map((p) => p.id);
    const items = ids.length ? await db.purchaseItems.where('purchaseId').anyOf(ids).toArray() : [];
    const itemsByPurchaseId = new Map();
    for (const item of items) {
      if (!itemsByPurchaseId.has(item.purchaseId)) itemsByPurchaseId.set(item.purchaseId, []);
      itemsByPurchaseId.get(item.purchaseId).push(item);
    }
    return { purchases, itemsByPurchaseId };
  }, [start, end]);

  return useMemo(() => {
    if (!raw || !categoryMap) return null;
    const subcategoryBreakdown = aggregateBySubcategory(raw.purchases, raw.itemsByPurchaseId, categoryMap, categoryId);
    const categoryPurchases = filterPurchasesByCategory(raw.purchases, raw.itemsByPurchaseId, categoryMap, categoryId);
    const total = subcategoryBreakdown.reduce((sum, row) => sum + row.amount, 0);

    return {
      total,
      subcategoryBreakdown,
      dayGroups: groupPurchasesByDay(categoryPurchases),
      itemsByPurchaseId: raw.itemsByPurchaseId,
    };
  }, [raw, categoryMap, categoryId]);
}
