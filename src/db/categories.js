import { db } from './db';
import { generateId } from '../lib/uuid';

// parentId === null can't be queried via the `parentId` index (IndexedDB
// doesn't index null values), so top-level categories are always fetched via
// toArray()+filter(). Subcategory lookups by a real parentId use the index.
export async function getAllCategories() {
  return db.categories.toArray();
}

export async function getTopLevelCategories() {
  return (await db.categories.toArray()).filter((c) => c.parentId === null);
}

export async function getSubcategories(parentId) {
  return db.categories.where('parentId').equals(parentId).toArray();
}

export async function getCategoryById(id) {
  if (!id) return undefined;
  return db.categories.get(id);
}

// A subcategory's color always matches its parent's (never stored/edited
// independently — resolved via the parent everywhere it's displayed), but
// its icon defaults to the parent's icon at creation time and can then be
// changed independently per subcategory from then on.
export async function createCategory({ name, parentId, icon, color }) {
  const siblings = parentId ? await getSubcategories(parentId) : await getTopLevelCategories({ includeArchived: true });
  let defaultIcon = 'Tag';
  if (parentId) {
    const parent = await getCategoryById(parentId);
    defaultIcon = parent?.icon || 'Tag';
  }
  const category = {
    id: generateId(),
    name: name.trim(),
    icon: icon || defaultIcon,
    color: parentId ? null : color || 'coral',
    parentId: parentId || null,
    isDefault: false,
    isArchived: false,
    sortOrder: siblings.length,
  };
  await db.categories.add(category);
  return category;
}

export async function updateCategory(id, patch) {
  await db.categories.update(id, patch);
}

// `orderedIds` is a full sibling group (all top-level categories, or all
// subcategories of one parent) in its new order — sortOrder is just the
// index within that group.
export async function reorderCategories(orderedIds) {
  await db.transaction('rw', db.categories, async () => {
    await Promise.all(orderedIds.map((id, index) => db.categories.update(id, { sortOrder: index })));
  });
}

// Archiving a top-level category cascades to its currently-active
// subcategories; restore only un-hides the category itself (subcategories
// archived independently stay archived, since the cascade only runs one way).
export async function archiveCategory(id) {
  const category = await db.categories.get(id);
  if (!category) return;
  await db.transaction('rw', db.categories, async () => {
    await db.categories.update(id, { isArchived: true });
    if (category.parentId === null) {
      const subs = await db.categories.where('parentId').equals(id).toArray();
      await Promise.all(subs.filter((s) => !s.isArchived).map((s) => db.categories.update(s.id, { isArchived: true })));
    }
  });
}

export async function restoreCategory(id) {
  await db.categories.update(id, { isArchived: false });
}
