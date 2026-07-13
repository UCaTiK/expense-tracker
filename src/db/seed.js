import { db } from './db';
import { generateId } from '../lib/uuid';
import { ICON_NAMES } from '../lib/icons';
import { CATEGORY_COLORS } from '../lib/colors';

// 8 top-level categories, one per accent color in the palette.
// defaultKey is a stable internal identifier used only for dedup matching —
// it survives user renames since it's never shown in the UI.
const DEFAULT_CATEGORIES = [
  {
    key: 'groceries',
    name: 'Продукты',
    icon: 'ShoppingCart',
    color: 'green',
    subcategories: [
      { key: 'groceries:ready', name: 'Готовая еда' },
      { key: 'groceries:produce', name: 'Овощи / Фрукты' },
      { key: 'groceries:meat', name: 'Мясо / Рыба / Яйца' },
      { key: 'groceries:bakery', name: 'Хлеб / Выпечка' },
      { key: 'groceries:dairy', name: 'Молочка / Сыр' },
      { key: 'groceries:grocery', name: 'Бакалея' },
      { key: 'groceries:drinks', name: 'Напитки' },
      { key: 'groceries:alcohol', name: 'Алкоголь' },
      { key: 'groceries:sweets', name: 'Сладости' },
      { key: 'groceries:addon', name: 'Дополнение' },
      { key: 'groceries:other', name: 'Прочее' },
      { key: 'groceries:uncategorized', name: 'Без категории' },
    ],
  },
  {
    key: 'food_out',
    name: 'Рестораны',
    icon: 'UtensilsCrossed',
    color: 'orange',
    subcategories: [
      { key: 'food_out:cafe', name: 'Кафе / фастфуд' },
      { key: 'food_out:restaurant', name: 'Рестораны' },
      { key: 'food_out:delivery', name: 'Доставка еды' },
      { key: 'food_out:drinks', name: 'Напитки' },
      { key: 'food_out:alcohol', name: 'Алкоголь' },
    ],
  },
  {
    key: 'clothes',
    name: 'Одежда',
    icon: 'Shirt',
    color: 'pink',
    subcategories: [
      { key: 'clothes:clothing', name: 'Одежда' },
      { key: 'clothes:shoes', name: 'Обувь' },
      { key: 'clothes:accessories', name: 'Аксессуары' },
    ],
  },
  {
    key: 'transport',
    name: 'Транспорт',
    icon: 'Car',
    color: 'blue',
    subcategories: [
      { key: 'transport:taxi', name: 'Такси' },
      { key: 'transport:public', name: 'Общественный транспорт' },
      { key: 'transport:carshare', name: 'Каршеринг' },
    ],
  },
  {
    key: 'home',
    name: 'Дом и быт',
    icon: 'Home',
    color: 'teal',
    subcategories: [
      { key: 'home:utilities', name: 'ЖКХ' },
      { key: 'home:communications', name: 'Связь и интернет' },
      { key: 'home:repair', name: 'Ремонт' },
      { key: 'home:household', name: 'Товары для дома' },
    ],
  },
  {
    key: 'health',
    name: 'Здоровье',
    icon: 'HeartPulse',
    color: 'red',
    subcategories: [
      { key: 'health:pharmacy', name: 'Аптека' },
      { key: 'health:doctors', name: 'Врачи' },
      { key: 'health:care', name: 'Уход' },
    ],
  },
  {
    key: 'entertainment',
    name: 'Развлечения',
    icon: 'Popcorn',
    color: 'purple',
    subcategories: [
      { key: 'entertainment:leisure', name: 'Досуг' },
      { key: 'entertainment:fun', name: 'Развлечения' },
      { key: 'entertainment:games', name: 'Игры' },
      { key: 'entertainment:hobby', name: 'Хобби' },
    ],
  },
  {
    key: 'other',
    name: 'Прочее',
    icon: 'MoreHorizontal',
    color: 'coral',
    subcategories: [
      { key: 'other:gifts', name: 'Подарки' },
      { key: 'other:misc', name: 'Прочее' },
    ],
  },
];

const DEFAULT_STYLE_BY_KEY = new Map(DEFAULT_CATEGORIES.map((top) => [top.key, { icon: top.icon, color: top.color }]));

const DEFAULT_TAGS = [
  { key: 'monthly', name: 'Ежемесячно', color: 'blue' },
  { key: 'weekly', name: 'Еженедельно', color: 'green' },
  { key: 'yearly', name: 'Ежегодно', color: 'purple' },
];

export async function seedDatabase() {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    const rows = [];
    DEFAULT_CATEGORIES.forEach((top, topIndex) => {
      const topId = generateId();
      rows.push({
        id: topId,
        name: top.name,
        icon: top.icon,
        color: top.color,
        parentId: null,
        isDefault: true,
        isArchived: false,
        sortOrder: topIndex,
        defaultKey: top.key,
      });
      top.subcategories.forEach((sub, subIndex) => {
        rows.push({
          id: generateId(),
          name: sub.name,
          icon: top.icon,
          color: null,
          parentId: topId,
          isDefault: true,
          isArchived: false,
          sortOrder: subIndex,
          defaultKey: sub.key,
        });
      });
    });

    await db.categories.bulkAdd(rows);
  }

  const tagCount = await db.tags.count();
  if (tagCount === 0) {
    await db.tags.bulkAdd(
      DEFAULT_TAGS.map((t) => ({ id: generateId(), name: t.name, color: t.color, defaultKey: t.key })),
    );
  }
}

let seedPromise = null;
export function ensureSeeded() {
  if (!seedPromise) seedPromise = seedDatabase();
  return seedPromise;
}

// Runs on every startup. Groups isDefault categories by defaultKey, keeps a
// deterministic survivor (lowest sortOrder, then lowest id), remaps any
// purchaseItems.subcategoryId pointing at a duplicate to the survivor's id,
// then deletes the duplicates. Guards against React.StrictMode-style
// double-seeding races leaving orphaned duplicate categories behind.
export async function dedupeDefaultCategories() {
  // isDefault is not an indexed field (booleans aren't valid IndexedDB keys),
  // so filter in memory rather than via .where().
  const all = (await db.categories.toArray()).filter((c) => c.isDefault);
  const groups = new Map();
  for (const cat of all) {
    if (!cat.defaultKey) continue;
    if (!groups.has(cat.defaultKey)) groups.set(cat.defaultKey, []);
    groups.get(cat.defaultKey).push(cat);
  }

  const idRemap = new Map();
  const idsToDelete = [];

  for (const group of groups.values()) {
    if (group.length <= 1) continue;
    group.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.id < b.id ? -1 : 1;
    });
    const [survivor, ...duplicates] = group;
    for (const dup of duplicates) {
      idRemap.set(dup.id, survivor.id);
      idsToDelete.push(dup.id);
    }
  }

  if (idsToDelete.length === 0) return;

  await db.transaction('rw', db.categories, db.purchaseItems, db.purchases, async () => {
    // Remap subcategory references on purchase items.
    for (const [dupId, survivorId] of idRemap) {
      await db.purchaseItems.where('subcategoryId').equals(dupId).modify({ subcategoryId: survivorId });
      await db.purchases.where('categoryId').equals(dupId).modify({ categoryId: survivorId });
      // Duplicate top-level categories may also be a subcategory's parent.
      await db.categories.where('parentId').equals(dupId).modify({ parentId: survivorId });
    }
    await db.categories.bulkDelete(idsToDelete);
  });
}

// Runs on every startup, after dedupe. Reconciles already-seeded default
// categories with the current DEFAULT_CATEGORIES definition — needed because
// changing DEFAULT_CATEGORIES only affects fresh installs via seedDatabase();
// an existing install already has rows in the DB that this has to migrate in
// place. Top-level default categories are matched by defaultKey and renamed/
// resorted in place (their id — and any purchase.categoryId pointing at it —
// never changes). Default subcategories are diffed by defaultKey: ones no
// longer in the definition are archived (never deleted — a deleted category
// would leave purchaseItems.subcategoryId dangling and break history), ones
// newly added are created, ones still present are resorted/un-archived.
export async function migrateDefaultCategoriesV2() {
  const all = await db.categories.toArray();
  const topsByKey = new Map(
    all.filter((c) => c.parentId === null && c.isDefault && c.defaultKey).map((c) => [c.defaultKey, c]),
  );

  for (const [topIndex, topDef] of DEFAULT_CATEGORIES.entries()) {
    const topRow = topsByKey.get(topDef.key);
    if (!topRow) continue;

    const topPatch = {};
    if (topRow.name !== topDef.name) topPatch.name = topDef.name;
    if (topRow.sortOrder !== topIndex) topPatch.sortOrder = topIndex;
    if (Object.keys(topPatch).length > 0) await db.categories.update(topRow.id, topPatch);

    const existingSubs = all.filter((c) => c.parentId === topRow.id && c.isDefault && c.defaultKey);
    const existingByKey = new Map(existingSubs.map((s) => [s.defaultKey, s]));
    const newKeys = new Set(topDef.subcategories.map((s) => s.key));

    for (const sub of existingSubs) {
      if (!newKeys.has(sub.defaultKey) && !sub.isArchived) {
        await db.categories.update(sub.id, { isArchived: true });
      }
    }

    for (const [subIndex, subDef] of topDef.subcategories.entries()) {
      const existing = existingByKey.get(subDef.key);
      if (existing) {
        const subPatch = {};
        if (existing.sortOrder !== subIndex) subPatch.sortOrder = subIndex;
        if (existing.name !== subDef.name) subPatch.name = subDef.name;
        if (existing.isArchived) subPatch.isArchived = false;
        if (Object.keys(subPatch).length > 0) await db.categories.update(existing.id, subPatch);
      } else {
        await db.categories.add({
          id: generateId(),
          name: subDef.name,
          icon: topDef.icon,
          color: null,
          parentId: topRow.id,
          isDefault: true,
          isArchived: false,
          sortOrder: subIndex,
          defaultKey: subDef.key,
        });
      }
    }
  }
}

// Runs on every startup, after dedupe. Self-heals top-level default
// categories whose icon/color ended up missing or unrecognized (e.g. from a
// stale/partial write in an old tab kept open across many code changes) by
// restoring the value from DEFAULT_CATEGORIES. Only touches values that are
// empty or don't match a known icon/color — a category the user deliberately
// re-styled via the edit menu always has a valid icon/color and is left
// alone, even though it's still isDefault/defaultKey-tagged.
//
// Also backfills any subcategory (default or user-created) that has no icon
// of its own with its parent's icon — subcategories never had icons before
// this was added, so this both seeds every pre-existing row once and
// self-heals going forward. A subcategory the user has since picked their
// own icon for always has a valid one and is left alone.
export async function repairDefaultCategoryStyling() {
  const all = await db.categories.toArray();
  const byId = new Map(all.map((c) => [c.id, c]));
  const fixes = [];
  for (const cat of all) {
    if (cat.parentId === null) {
      if (!cat.isDefault || !cat.defaultKey) continue;
      const expected = DEFAULT_STYLE_BY_KEY.get(cat.defaultKey);
      if (!expected) continue;

      const patch = {};
      if (!cat.icon || !ICON_NAMES.includes(cat.icon)) patch.icon = expected.icon;
      if (!cat.color || !CATEGORY_COLORS.includes(cat.color)) patch.color = expected.color;
      if (Object.keys(patch).length > 0) fixes.push(db.categories.update(cat.id, patch));
    } else if (!cat.icon || !ICON_NAMES.includes(cat.icon)) {
      const parent = byId.get(cat.parentId);
      if (parent?.icon) fixes.push(db.categories.update(cat.id, { icon: parent.icon }));
    }
  }
  if (fixes.length > 0) await Promise.all(fixes);
}

export { DEFAULT_CATEGORIES };
