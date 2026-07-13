import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useCategoryMap } from './useCategories';
import { getPeriodRange, aggregateBySubcategory, filterPurchasesByCategory, groupPurchasesByDay } from '../lib/analytics';

// Dates of every purchase ever attributed to this category, regardless of
// period — used only to decide whether prev/next navigation should be
// allowed (is there category data further out in that direction), not for
// display. Deliberately unscoped by date range, unlike the hook below.
export function useCategoryPurchaseDates(categoryId) {
  const categoryMap = useCategoryMap();
  const raw = useLiveQuery(async () => {
    const purchases = await db.purchases.toArray();
    const items = await db.purchaseItems.toArray();
    const itemsByPurchaseId = new Map();
    for (const item of items) {
      if (!itemsByPurchaseId.has(item.purchaseId)) itemsByPurchaseId.set(item.purchaseId, []);
      itemsByPurchaseId.get(item.purchaseId).push(item);
    }
    return { purchases, itemsByPurchaseId };
  }, []);

  return useMemo(() => {
    if (!raw || !categoryMap) return [];
    return filterPurchasesByCategory(raw.purchases, raw.itemsByPurchaseId, categoryMap, categoryId).map((p) => p.date);
  }, [raw, categoryMap, categoryId]);
}

// Single-category counterpart to useAnalyticsData — same two-step Dexie
// fetch (purchases in range -> their items), but scoped to one top-level
// category's subcategory breakdown and purchase list instead of a
// category-vs-category comparison.
export function useCategoryAnalyticsData(categoryId, periodType, anchorDate) {
  const categoryMap = useCategoryMap();
  const { start, end } = useMemo(() => getPeriodRange(periodType, anchorDate), [periodType, anchorDate]);

  const raw = useLiveQuery(async () => {
    // .between() on an indexed field iterates in ascending key order by
    // default — reverse to newest-first, matching Home's purchase list.
    const purchases = (await db.purchases.where('date').between(start, end, true, false).toArray()).sort(
      (a, b) => b.date - a.date,
    );
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
