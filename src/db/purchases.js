import { db } from './db';
import { generateId } from '../lib/uuid';
import { upsertPlaceLastUsed } from './places';
import { resolveTopCategoryId } from '../lib/categoryTree';

// In detailed mode, purchase.categoryId is a fallback for list-row display
// (spec: "используется в быстром режиме или как fallback"). If every item
// agrees on the exact same subcategory (or category-only pick), that exact
// id is attached directly — not resolved up to its top-level parent — so
// the list row can show the precise subcategory rather than a generic
// top-level label. Otherwise it falls back to whichever top-level category
// is most common among the items (ties broken by first-seen order), not
// just the single largest item's category.
async function computeFallbackCategoryId(items) {
  if (items.length === 0) return null;

  const distinctIds = new Set(items.map((it) => it.subcategoryId));
  if (distinctIds.size === 1) return items[0].subcategoryId;

  const topIds = [];
  for (const item of items) {
    const category = await db.categories.get(item.subcategoryId);
    const topId = resolveTopCategoryId(category);
    if (topId) topIds.push(topId);
  }
  if (topIds.length === 0) return null;

  const counts = new Map();
  for (const id of topIds) counts.set(id, (counts.get(id) || 0) + 1);
  let best = topIds[0];
  let bestCount = 0;
  for (const id of topIds) {
    const count = counts.get(id);
    if (count > bestCount) {
      best = id;
      bestCount = count;
    }
  }
  return best;
}

// Single entry point for both create and edit — the only difference is
// whether `data.id` is set, matching the spec's "one form for create/edit".
export async function savePurchase(data) {
  const { id, date, place, totalPaid, note, tagIds, mode, quickCategoryId, items } = data;
  const purchaseId = id || generateId();

  const cleanItems =
    mode === 'detailed'
      ? (items || [])
          .filter((it) => it.subcategoryId && Number(it.amount) > 0)
          .map((it) => ({
            id: it.id || generateId(),
            purchaseId,
            name: (it.name || '').trim(),
            subcategoryId: it.subcategoryId,
            amount: Number(it.amount),
          }))
      : [];

  const needsDetail = cleanItems.length === 0;
  const categoryId =
    mode === 'detailed' && cleanItems.length > 0 ? await computeFallbackCategoryId(cleanItems) : quickCategoryId || null;

  await db.transaction('rw', db.purchases, db.purchaseItems, db.places, async () => {
    await db.purchases.put({
      id: purchaseId,
      date,
      place: (place || '').trim(),
      totalPaid: Number(totalPaid),
      categoryId,
      note: (note || '').trim(),
      tagIds: tagIds || [],
      needsDetail,
      accountId: null,
    });

    await db.purchaseItems.where('purchaseId').equals(purchaseId).delete();
    if (cleanItems.length) {
      await db.purchaseItems.bulkAdd(cleanItems);
    }

    // Only quick-mode saves teach the place->category suggestion — a
    // detailed purchase's fallback categoryId is derived from item amounts,
    // not a deliberate category choice for this place.
    if (place) await upsertPlaceLastUsed(place, mode === 'quick' ? categoryId : undefined);
  });

  return purchaseId;
}

export async function deletePurchase(id) {
  await db.transaction('rw', db.purchases, db.purchaseItems, async () => {
    await db.purchaseItems.where('purchaseId').equals(id).delete();
    await db.purchases.delete(id);
  });
}

export async function getPurchase(id) {
  return db.purchases.get(id);
}

export async function getPurchaseItems(purchaseId) {
  return db.purchaseItems.where('purchaseId').equals(purchaseId).toArray();
}

export async function getPurchasesInRange(startTs, endTsExclusive) {
  return db.purchases.where('date').between(startTs, endTsExclusive, true, false).toArray();
}
