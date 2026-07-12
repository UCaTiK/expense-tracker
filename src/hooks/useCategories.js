import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useAllCategories() {
  return useLiveQuery(() => db.categories.toArray(), []);
}

export function useTopLevelCategories({ includeArchived = false } = {}) {
  return useLiveQuery(
    () =>
      db.categories
        .toArray()
        .then((all) => all.filter((c) => c.parentId === null && (includeArchived || !c.isArchived)))
        .then((list) => list.sort((a, b) => a.sortOrder - b.sortOrder)),
    [includeArchived],
  );
}

export function useSubcategories(parentId, { includeArchived = false } = {}) {
  return useLiveQuery(() => {
    if (!parentId) return [];
    return db.categories
      .where('parentId')
      .equals(parentId)
      .toArray()
      .then((list) => list.filter((c) => includeArchived || !c.isArchived))
      .then((list) => list.sort((a, b) => a.sortOrder - b.sortOrder));
  }, [parentId, includeArchived]);
}

// Full accordion tree: top-level categories with their subcategories nested.
export function useCategoryTree({ includeArchived = false } = {}) {
  return useLiveQuery(
    () =>
      db.categories.toArray().then((all) => {
        const tops = all
          .filter((c) => c.parentId === null && (includeArchived || !c.isArchived))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        return tops.map((top) => ({
          ...top,
          subcategories: all
            .filter((c) => c.parentId === top.id && (includeArchived || !c.isArchived))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        }));
      }),
    [includeArchived],
  );
}

export function useCategoryMap() {
  const all = useAllCategories();
  return useMemo(() => new Map((all || []).map((c) => [c.id, c])), [all]);
}
