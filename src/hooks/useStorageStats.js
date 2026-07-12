import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const TABLES = ['purchases', 'purchaseItems', 'categories', 'tags', 'categoryHints', 'places'];

// Computed directly from the actual row content of every table (UTF-8 byte
// size of its JSON), not navigator.storage.estimate() — that API reports
// the whole origin's storage bucket, dominated by the PWA's own cached
// app code (the JS bundle alone is 300+ KB) once a service worker is
// active, which makes "your data" look far bigger than it really is.
export function useStorageStats() {
  return useLiveQuery(async () => {
    const counts = {};
    let bytesUsed = 0;
    for (const table of TABLES) {
      const rows = await db[table].toArray();
      counts[table] = rows.length;
      bytesUsed += new TextEncoder().encode(JSON.stringify(rows)).length;
    }

    return {
      purchases: counts.purchases,
      categories: counts.categories,
      tags: counts.tags,
      places: counts.places,
      bytesUsed,
    };
  }, []);
}
