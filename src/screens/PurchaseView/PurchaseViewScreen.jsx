import { useMemo, useState } from 'react';
import { ChevronLeft, Trash2, Pencil } from 'lucide-react';
import { usePurchase } from '../../hooks/usePurchases';
import { usePurchaseItems } from '../../hooks/usePurchaseItems';
import { useCategoryMap } from '../../hooks/useCategories';
import { useAllTags } from '../../hooks/useTags';
import { deletePurchase } from '../../db/purchases';
import Amount from '../../components/common/Amount';
import TagChip from '../../components/common/TagChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryBreakdownBar from './CategoryBreakdownBar';
import { getCategoryColorVar } from '../../lib/colors';
import { formatShortDate } from '../../lib/format';
import { resolveTopCategoryId } from '../../lib/categoryTree';

export default function PurchaseViewScreen({ purchaseId, onEdit, onBack, onDeleted }) {
  const purchase = usePurchase(purchaseId);
  const items = usePurchaseItems(purchaseId);
  const categoryMap = useCategoryMap();
  const tags = useAllTags();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const breakdown = useMemo(() => {
    if (!items || !categoryMap) return [];
    const totals = new Map();
    for (const item of items) {
      const category = categoryMap.get(item.subcategoryId);
      const topId = resolveTopCategoryId(category);
      totals.set(topId, (totals.get(topId) || 0) + item.amount);
    }
    const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
    return [...totals.entries()]
      .map(([topId, amount]) => ({ category: categoryMap.get(topId), amount, percent: (amount / sum) * 100 }))
      .sort((a, b) => b.amount - a.amount);
  }, [items, categoryMap]);

  // One row per exact subcategoryId (not rolled up to the top-level parent
  // like `breakdown` above) — items that picked a category only, with no
  // subcategory, share a bucket keyed by that category's own id.
  const subcategoryBreakdown = useMemo(() => {
    if (!items || !categoryMap) return [];
    const totals = new Map();
    for (const item of items) {
      totals.set(item.subcategoryId, (totals.get(item.subcategoryId) || 0) + item.amount);
    }
    const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
    return [...totals.entries()]
      .map(([subId, amount]) => {
        const sub = categoryMap.get(subId);
        const top = categoryMap.get(resolveTopCategoryId(sub));
        return { subcategory: sub, topColor: top?.color, amount, percent: (amount / sum) * 100 };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [items, categoryMap]);

  const sortedItems = useMemo(() => (items ? [...items].sort((a, b) => b.amount - a.amount) : items), [items]);

  if (!purchase || !categoryMap) return null;

  const purchaseTags = (purchase.tagIds || [])
    .map((id) => (tags || []).find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{purchase.place || 'Без названия'}</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{formatShortDate(purchase.date)}</div>
        <Amount value={purchase.totalPaid} size="lg" />

        {purchaseTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {purchaseTags.map((tag) => (
              <TagChip key={tag.id} label={tag.name} color={tag.color} />
            ))}
          </div>
        )}

        {purchase.note && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>{purchase.note}</p>}

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Разбивка по категориям</div>
          {purchase.needsDetail ? (
            <div style={{ fontSize: 14, color: 'var(--text-faint)' }}>Покупка не детализирована</div>
          ) : (
            breakdown.map((b) => <CategoryBreakdownBar key={b.category?.id || 'other'} {...b} />)
          )}
        </div>

        {!purchase.needsDetail && subcategoryBreakdown.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Разбивка по подкатегориям</div>
            {subcategoryBreakdown.map((b) => (
              <SubcategoryBreakdownBar key={b.subcategory?.id || 'other'} {...b} />
            ))}
          </div>
        )}

        {sortedItems && sortedItems.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Позиции ({sortedItems.length})</div>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {sortedItems.map((item, i) => {
                const sub = categoryMap.get(item.subcategoryId);
                const top = categoryMap.get(resolveTopCategoryId(sub));
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderTop: i > 0 ? '0.5px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: getCategoryColorVar(top?.color), flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14 }}>{item.name || sub?.name || 'Без названия'}</div>
                      {item.name && sub && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{sub.name}</div>}
                    </div>
                    <Amount value={item.amount} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button
            onClick={() => onEdit(purchase.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--text)',
              color: 'var(--bg)',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <Pencil size={16} /> Редактировать
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            aria-label="Удалить"
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '0.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--danger)',
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить покупку?"
        message="Действие необратимо."
        confirmLabel="Удалить"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await deletePurchase(purchase.id);
          setConfirmOpen(false);
          onDeleted();
        }}
      />
    </div>
  );
}

// Subcategories have no icon/color of their own — the bar uses the parent
// top-level category's color instead, matching the item list's color dots.
function SubcategoryBreakdownBar({ subcategory, topColor, amount, percent }) {
  const color = getCategoryColorVar(topColor);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 13 }}>{subcategory?.name || 'Без подкатегории'}</span>
        <Amount value={amount} size="sm" />
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}
