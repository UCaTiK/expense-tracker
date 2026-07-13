import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, MapPin, Search } from 'lucide-react';
import PlaceRow from './PlaceRow';
import EmptyState from '../../components/common/EmptyState';
import { useAllPlaces } from '../../hooks/usePlaces';
import { useTopLevelCategories, useCategoryMap } from '../../hooks/useCategories';
import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';
import { inputStyle } from '../../lib/formStyles';

export default function PlacesScreen({ onBack }) {
  const places = useAllPlaces();
  const categoryMap = useCategoryMap();
  const topCategories = useTopLevelCategories({ includeArchived: true });
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggleSection = (key) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!places) return places;
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) => p.name.toLowerCase().includes(q));
  }, [places, query]);

  // Places are shown grouped by their learned/assigned category (in the
  // category's own sort order, matching the Categories screen), with a
  // trailing "Без категории" section — rather than one flat alphabetical
  // list — so it's easy to see and fix at a glance which places ended up
  // in which category.
  const sections = useMemo(() => {
    if (!filtered || !categoryMap || !topCategories) return [];
    const byCategoryId = new Map();
    const uncategorized = [];
    for (const place of filtered) {
      if (place.defaultCategoryId) {
        if (!byCategoryId.has(place.defaultCategoryId)) byCategoryId.set(place.defaultCategoryId, []);
        byCategoryId.get(place.defaultCategoryId).push(place);
      } else {
        uncategorized.push(place);
      }
    }
    const result = [];
    for (const cat of topCategories) {
      const placesForCat = byCategoryId.get(cat.id);
      if (placesForCat) {
        result.push({ category: cat, places: placesForCat });
        byCategoryId.delete(cat.id);
      }
    }
    // Any remaining ids point at a category not in topCategories for some
    // other reason — still show them under whatever name categoryMap has.
    for (const [categoryId, placesForCat] of byCategoryId) {
      result.push({ category: categoryMap.get(categoryId) || null, places: placesForCat });
    }
    if (uncategorized.length > 0) {
      result.push({ category: null, places: uncategorized });
    }
    return result;
  }, [filtered, categoryMap, topCategories]);

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

      {sections.map(({ category, places: placesForCategory }) => {
        const key = category?.id || 'none';
        const Icon = category ? getIconComponent(category.icon) : null;
        const isExpanded = !collapsed.has(key);
        return (
          <div key={key} style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => toggleSection(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '0 16px 8px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
              }}
            >
              {category ? (
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: getCategoryColorVar(category.color),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={10} color="#121212" />
                </span>
              ) : (
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '0.5px dashed var(--border)', flexShrink: 0 }} />
              )}
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)' }}>
                {category ? category.name : 'Без категории'}
              </span>
              <ChevronDown
                size={16}
                color="var(--text-faint)"
                style={{ transform: isExpanded ? 'none' : 'rotate(-90deg)', flexShrink: 0 }}
              />
            </button>
            {isExpanded && (
              <div style={{ background: 'var(--surface)', margin: '0 16px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {placesForCategory.map((place, i) => (
                  <div key={place.name} style={{ borderTop: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
                    <PlaceRow place={place} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {places && places.length === 0 && (
        <EmptyState icon={MapPin} title="Мест пока нет" subtitle="Места появятся здесь после первых покупок" />
      )}

      {places && places.length > 0 && filtered && filtered.length === 0 && (
        <EmptyState icon={Search} title="Ничего не найдено" subtitle="Попробуйте другой запрос" />
      )}
    </div>
  );
}
