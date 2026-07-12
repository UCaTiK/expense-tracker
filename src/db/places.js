import { db } from './db';

// `defaultCategoryId` is only ever written when a quick purchase is saved
// for this place (see savePurchase) — detailed-mode saves pass `undefined`
// here so they update `lastUsed` without touching the learned category.
export async function upsertPlaceLastUsed(name, defaultCategoryId) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;
  const existing = await db.places.get(trimmed);
  await db.places.put({
    name: trimmed,
    lastUsed: Date.now(),
    defaultCategoryId: defaultCategoryId !== undefined ? defaultCategoryId : (existing?.defaultCategoryId ?? null),
  });
}

export async function searchPlaces(prefix) {
  const trimmed = (prefix || '').trim();
  if (!trimmed) {
    return db.places.orderBy('lastUsed').reverse().limit(8).toArray();
  }
  return db.places.where('name').startsWithIgnoreCase(trimmed).limit(8).toArray();
}

export async function listAllPlaces() {
  return db.places.orderBy('name').toArray();
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
