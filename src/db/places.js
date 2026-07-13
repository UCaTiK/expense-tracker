import { db } from './db';

// `defaultCategoryId` is only ever offered when a quick purchase is saved
// for this place (see savePurchase) — detailed-mode saves pass `undefined`
// here so they update `lastUsed` without touching the learned category.
// It's learned only once: the first quick purchase at a place with no
// category yet sets it, but once a place has one, later quick purchases
// never overwrite it even if a different category is picked — from then on
// it only changes through the Places editor (setPlaceCategory).
export async function upsertPlaceLastUsed(name, defaultCategoryId) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;
  const existing = await db.places.get(trimmed);
  await db.places.put({
    name: trimmed,
    lastUsed: Date.now(),
    defaultCategoryId: existing?.defaultCategoryId ?? defaultCategoryId ?? null,
  });
}

export async function searchPlaces(prefix) {
  const trimmed = (prefix || '').trim();
  if (!trimmed) {
    return db.places.orderBy('lastUsed').reverse().limit(8).toArray();
  }
  return db.places.where('name').startsWithIgnoreCase(trimmed).limit(8).toArray();
}

// `.orderBy('name')` sorts by raw IndexedDB key comparison (UTF-16 code
// unit order), which is case-sensitive — e.g. every "Z..." name would sort
// before any "a..." name. Fetch unsorted and sort with localeCompare
// instead, case-insensitively (`sensitivity: 'base'`), so names differing
// only by capitalization land in proper alphabetical order.
export async function listAllPlaces() {
  const places = await db.places.toArray();
  return places.sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));
}

export async function getPlace(name) {
  if (!name) return undefined;
  return db.places.get(name);
}

// Places are a plain string field on Purchase (no foreign key), so renaming
// or deleting a place here never touches existing purchase records — it
// only affects the autocomplete suggestion list, per design.
export async function renamePlace(oldName, newName) {
  const trimmed = (newName || '').trim();
  if (!trimmed || trimmed === oldName) return;
  const existing = await db.places.get(oldName);
  if (!existing) return;
  await db.transaction('rw', db.places, async () => {
    await db.places.delete(oldName);
    await db.places.put({ ...existing, name: trimmed });
  });
}

export async function deletePlace(name) {
  await db.places.delete(name);
}

export async function setPlaceCategory(name, categoryId) {
  await db.places.update(name, { defaultCategoryId: categoryId });
}
