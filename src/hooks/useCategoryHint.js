import { useLiveQuery } from 'dexie-react-hooks';
import { lookupHint } from '../db/categoryHints';

export function useCategoryHint(itemName) {
  return useLiveQuery(() => lookupHint(itemName), [itemName]);
}
