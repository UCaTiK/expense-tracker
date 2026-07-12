import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

// Home shows the full purchase history (newest first) — only the month
// total in the header is scoped to the current month, computed client-side
// from this same list rather than via a separate range query.
export function useAllPurchases() {
  return useLiveQuery(() => db.purchases.orderBy('date').reverse().toArray(), []);
}

export function usePurchase(id) {
  return useLiveQuery(() => (id ? db.purchases.get(id) : undefined), [id]);
}
