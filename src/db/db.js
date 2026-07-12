import Dexie from 'dexie';

export const db = new Dexie('expenseTrackerDB');

db.version(1).stores({
  purchases: 'id, date, categoryId',
  purchaseItems: 'id, purchaseId, subcategoryId',
  categories: 'id, parentId, sortOrder',
  tags: 'id, &name',
  categoryHints: 'normalizedName, subcategoryId, lastUsed',
  places: 'name, lastUsed',
});
