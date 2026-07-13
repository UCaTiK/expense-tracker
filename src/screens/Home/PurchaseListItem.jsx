import { getIconComponent } from '../../lib/icons';
import { getCategoryColorVar } from '../../lib/colors';
import { resolveTopCategoryId } from '../../lib/categoryTree';
import Amount from '../../components/common/Amount';
import TagChip from '../../components/common/TagChip';

const ICON_SIZE = 36;
const ICON_GAP = 12;

export default function PurchaseListItem({ purchase, categoryMap, tagMap, onClick }) {
  // purchase.categoryId is either an exact subcategory (every item in a
  // detailed purchase agreed on one) or a top-level category (quick-mode
  // pick, or the most-common top category among several different
  // subcategories) — resolved up to its top-level ancestor for icon/color,
  // but shown as whichever of the two it actually is for the label.
  const directCategory = categoryMap.get(purchase.categoryId);
  const topCategory = categoryMap.get(resolveTopCategoryId(directCategory));

  const label = purchase.needsDetail ? 'Не детализировано' : directCategory?.name || 'Разное';

  const Icon = getIconComponent(topCategory?.icon);
  const color = topCategory ? getCategoryColorVar(topCategory.color) : 'var(--text-faint)';

  const purchaseTags = (purchase.tagIds || []).map((id) => tagMap.get(id)).filter(Boolean);
  const visibleTags = purchaseTags.slice(0, 2);
  const extraCount = purchaseTags.length - visibleTags.length;

  return (
    // Tags render in their own row below the icon/text/amount row (not as a
    // sibling participating in its alignItems:center), so a purchase with
    // tags grows taller downward without shifting the icon or amount, which
    // always stay centered on just the place+category line.
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '10px 16px 10px 10px',
        background: 'none',
        border: 'none',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: ICON_GAP }}>
        <div
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={17} color="#121212" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {purchase.place || 'Без названия'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            {purchase.needsDetail && (
              <span
                aria-hidden
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-orange)', flexShrink: 0 }}
              />
            )}
            <span style={{ fontSize: 12, color: purchase.needsDetail ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
              {label}
            </span>
          </div>
        </div>
        <Amount value={purchase.totalPaid} size="md" />
      </div>
      {visibleTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, marginLeft: ICON_SIZE + ICON_GAP }}>
          {visibleTags.map((tag) => (
            <TagChip key={tag.id} label={tag.name} color={tag.color} size="sm" />
          ))}
          {extraCount > 0 && <TagChip label={`+${extraCount}`} size="sm" />}
        </div>
      )}
    </button>
  );
}
