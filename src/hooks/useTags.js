import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useAllTags() {
  return useLiveQuery(() => db.tags.orderBy('name').toArray(), []);
}
