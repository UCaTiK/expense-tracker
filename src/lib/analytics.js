// Pure date/aggregation logic for the Analytics screen — no Dexie/React
// imports, so the date math can be reasoned about (and unit-tested later)
// in isolation from data fetching and rendering.

import { resolveTopCategoryId } from './categoryTree';

export function getPeriodRange(periodType, anchorDate) {
  const d = new Date(anchorDate);
  if (periodType === 'week') {
    // Monday-start week.
    const dow = d.getDay();
    const diffToMonday = (dow + 6) % 7;
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start: start.getTime(), end: end.getTime() };
  }
  if (periodType === 'month') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return { start: start.getTime(), end: end.getTime() };
  }
  if (periodType === 'year') {
    const start = new Date(d.getFullYear(), 0, 1);
    const end = new Date(d.getFullYear() + 1, 0, 1);
    return { start: start.getTime(), end: end.getTime() };
  }
  throw new Error(`Unknown period type: ${periodType}`);
}

// Returns a new anchor date guaranteed to fall inside the adjacent period.
// Works uniformly for week/month/year: the current period's end instant is
// always inside the next period, and one day before its start is always
// inside the previous period (JS Date handles month/year rollover for us).
export function shiftPeriod(periodType, anchorDate, direction) {
  const range = getPeriodRange(periodType, anchorDate);
  if (direction > 0) return new Date(range.end);
  const prev = new Date(range.start);
  prev.setDate(prev.getDate() - 1);
  return prev;
}

const weekLabelFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const monthLabelFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

export function getPeriodLabel(periodType, anchorDate) {
  const { start, end } = getPeriodRange(periodType, anchorDate);
  if (periodType === 'week') {
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() - 1);
    return `${weekLabelFormatter.format(new Date(start))} – ${weekLabelFormatter.format(lastDay)}`;
  }
  if (periodType === 'month') {
    const label = monthLabelFormatter.format(new Date(start));
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  return String(new Date(start).getFullYear());
}

export function isPeriodOngoing(periodType, anchorDate, today) {
  const { start, end } = getPeriodRange(periodType, anchorDate);
  const t = today.getTime();
  return t >= start && t < end;
}

// Determines the date ranges to fetch/compare for a period. When the
// selected period is ongoing, `mode` controls whether the previous period
// is truncated to the same elapsed length ('toDate', a fair comparison) or
// used in full ('full', rougher but shows scale). Fully-past periods always
// compare full-to-full regardless of mode.
export function getComparisonRanges(periodType, anchorDate, mode, today) {
  const current = getPeriodRange(periodType, anchorDate);
  const ongoing = isPeriodOngoing(periodType, anchorDate, today);
  const previousAnchor = shiftPeriod(periodType, anchorDate, -1);
  const previousFull = getPeriodRange(periodType, previousAnchor);

  if (!ongoing) {
    return { currentRange: current, previousRange: previousFull, isOngoing: false };
  }

  if (mode === 'toDate') {
    const elapsed = today.getTime() - current.start;
    const truncatedCurrentEnd = Math.min(current.start + elapsed, current.end);
    return {
      currentRange: { start: current.start, end: truncatedCurrentEnd },
      previousRange: { start: previousFull.start, end: Math.min(previousFull.start + elapsed, previousFull.end) },
      isOngoing: true,
    };
  }

  return { currentRange: current, previousRange: previousFull, isOngoing: true };
}

// Rolls purchase totals up to top-level categories. Detailed purchases
// attribute each item's amount to its subcategory's parent; undetailed
// purchases attribute their full totalPaid to purchase.categoryId (the
// quick-mode selection).
export function aggregateByCategory(purchases, itemsByPurchaseId, categoryMap) {
  const totals = new Map();
  const add = (categoryId, amount) => {
    totals.set(categoryId, (totals.get(categoryId) || 0) + amount);
  };

  for (const purchase of purchases) {
    if (purchase.needsDetail) {
      add(purchase.categoryId || null, purchase.totalPaid);
      continue;
    }
    const items = itemsByPurchaseId.get(purchase.id) || [];
    for (const item of items) {
      const category = categoryMap.get(item.subcategoryId);
      add(resolveTopCategoryId(category), item.amount);
    }
  }

  return [...totals.entries()]
    .map(([categoryId, amount]) => ({ categoryId, category: categoryMap.get(categoryId) || null, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTotal(purchases) {
  return purchases.reduce((sum, p) => sum + p.totalPaid, 0);
}

export function countUndetailedPurchases(purchases) {
  return purchases.filter((p) => p.needsDetail).length;
}

export function hasInsufficientPreviousData(previousPurchases) {
  return previousPurchases.length === 0;
}

export function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}

// Merges current/previous per-category aggregates, sorted by current amount
// desc (spec: "список категорий по убыванию суммы"). A category with no
// prior-period spend gets changePercent: null (UI shows "новое").
export function compareCategoryAggregates(currentAgg, previousAgg) {
  const previousById = new Map(previousAgg.map((row) => [row.categoryId, row.amount]));
  return currentAgg
    .map((row) => ({
      ...row,
      previousAmount: previousById.get(row.categoryId) || 0,
      changePercent: percentChange(row.amount, previousById.get(row.categoryId) || 0),
    }))
    .sort((a, b) => b.amount - a.amount);
}
