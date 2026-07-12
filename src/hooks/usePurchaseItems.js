import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function usePurchaseItems(purchaseId) {
  return useLiveQuery(
    () => (purchaseId ? db.purchaseItems.where('purchaseId').equals(purchaseId).toArray() : []),
    [purchaseId],
  );
}

// Batches item lookups for a list of purchases (e.g. a month of Home rows)
// into a single query instead of one query per row.
export function usePurchaseItemsByPurchaseIds(purchaseIds) {
  const key = (purchaseIds || []).join(',');
  return useLiveQuery(async () => {
    if (!purchaseIds || purchaseIds.length === 0) return new Map();
    const items = await db.purchaseItems.where('purchaseId').anyOf(purchaseIds).toArray();
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.purchaseId)) map.set(item.purchaseId, []);
      map.get(item.purchaseId).push(item);
    }
    return map;
  }, [key]) || new Map();
}
