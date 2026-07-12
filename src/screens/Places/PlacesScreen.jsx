import { useMemo, useState } from 'react';
import { ChevronLeft, MapPin, Search } from 'lucide-react';
import PlaceRow from './PlaceRow';
import EmptyState from '../../components/common/EmptyState';
import { useAllPlaces } from '../../hooks/usePlaces';
import { inputStyle } from '../../lib/formStyles';

export default function PlacesScreen({ onBack }) {
  const places = useAllPlaces();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!places) return places;
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) => p.name.toLowerCase().includes(q));
  }, [places, query]);

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Места</h1>
      </div>

      {places && places.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--text-faint)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск места"
              style={{ ...inputStyle, paddingLeft: 38 }}
            />
          </div>
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div style={{ background: 'var(--surface)', margin: '0 16px 16px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {filtered.map((place, i) => (
            <div key={place.name} style={{ borderTop: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
              <PlaceRow place={place} />
            </div>
          ))}
        </div>
      )}

      {places && places.length === 0 && (
        <EmptyState icon={MapPin} title="Мест пока нет" subtitle="Места появятся здесь после первых покупок" />
      )}

      {places && places.length > 0 && filtered && filtered.length === 0 && (
        <EmptyState icon={Search} title="Ничего не найдено" subtitle="Попробуйте другой запрос" />
      )}
    </div>
  );
}
