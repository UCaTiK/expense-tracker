import { db } from './db';
import { generateId } from '../lib/uuid';
import { CATEGORY_COLORS } from '../lib/colors';

export async function listTags() {
  return db.tags.orderBy('name').toArray();
}

async function nextDefaultColor() {
  const count = await db.tags.count();
  return CATEGORY_COLORS[count % CATEGORY_COLORS.length];
}

export async function getOrCreateTag(rawName) {
  const name = (rawName || '').trim();
  if (!name) return null;
  const existing = await db.tags.where('name').equalsIgnoreCase(name).first();
  if (existing) return existing;
  const tag = { id: generateId(), name, color: await nextDefaultColor() };
  await db.tags.add(tag);
  return tag;
}

export async function createTag(rawName) {
  return getOrCreateTag(rawName);
}

export async function updateTag(id, patch) {
  await db.tags.update(id, patch);
}

// Deleting a tag removes it everywhere — it no longer exists, so keeping
// stale references on old purchases would just be dead ids. tagIds isn't
// indexed (see db.js), so purchases are scanned and filtered in memory.
export async function deleteTag(id) {
  await db.transaction('rw', db.tags, db.purchases, async () => {
    await db.tags.delete(id);
    const purchases = await db.purchases.toArray();
    const affected = purchases.filter((p) => p.tagIds && p.tagIds.includes(id));
    await Promise.all(affected.map((p) => db.purchases.update(p.id, { tagIds: p.tagIds.filter((t) => t !== id) })));
  });
}
