import { useLiveQuery } from 'dexie-react-hooks';
import { searchPlaces, listAllPlaces, getPlace } from '../db/places';

export function usePlaceSuggestions(prefix) {
  return useLiveQuery(() => searchPlaces(prefix), [prefix]) || [];
}

export function useAllPlaces() {
  return useLiveQuery(() => listAllPlaces(), []);
}

export function usePlaceRecord(name) {
  return useLiveQuery(() => getPlace(name), [name]);
}
