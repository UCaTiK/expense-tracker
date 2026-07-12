import { db } from './db';
import { normalizeItemName } from '../lib/text';

export async function lookupHint(rawName) {
  const norm = normalizeItemName(rawName);
  if (!norm) return null;
  return db.categoryHints.get(norm);
}

export async function recordHint(rawName, subcategoryId) {
  const norm = normalizeItemName(rawName);
  if (!norm || !subcategoryId) return;
  await db.categoryHints.put({ normalizedName: norm, subcategoryId, lastUsed: Date.now() });
}
