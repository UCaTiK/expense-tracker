import { db } from './db';
import { seedDatabase } from './seed';
import { downloadJson } from '../lib/download';

const SCHEMA_VERSION = 1;
const TABLES = ['purchases', 'purchaseItems', 'categories', 'tags', 'categoryHints', 'places'];
const LAST_BACKUP_KEY = 'expense-tracker:lastBackupAt';

export async function exportData() {
  const data = {};
  for (const table of TABLES) {
    data[table] = await db[table].toArray();
  }
  const payload = { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
  downloadJson(`expense-tracker-backup-${payload.exportedAt.slice(0, 10)}.json`, payload);
  localStorage.setItem(LAST_BACKUP_KEY, payload.exportedAt);
  return payload;
}

export function getLastBackupAt() {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

export async function importData(json) {
  if (!json || json.schemaVersion !== SCHEMA_VERSION || !json.data) {
    throw new Error('Некорректный файл резервной копии');
  }
  for (const table of TABLES) {
    if (!Array.isArray(json.data[table])) {
      throw new Error(`В файле отсутствуют данные таблицы "${table}"`);
    }
  }
  await db.transaction('rw', TABLES.map((t) => db[t]), async () => {
    for (const table of TABLES) {
      await db[table].clear();
      if (json.data[table].length) await db[table].bulkPut(json.data[table]);
    }
  });
}

export async function clearAllData() {
  await db.transaction('rw', TABLES.map((t) => db[t]), async () => {
    for (const table of TABLES) await db[table].clear();
  });
  await seedDatabase();
}
