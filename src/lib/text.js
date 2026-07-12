// Normalizes a purchase-item name for CategoryHint lookups: lowercase,
// strip digits/percent signs (e.g. "молоко 3.2%" and "Молоко" should hit the
// same hint), collapse whitespace.
export function normalizeItemName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[0-9%.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
