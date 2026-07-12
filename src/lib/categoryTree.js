// A PurchaseItem's category reference can point at either a genuine
// subcategory (has parentId) or a top-level category directly (parentId
// null — the user picked only the category, no subcategory). Both cases
// resolve to the same top-level "bucket" id for display/aggregation.
export function resolveTopCategoryId(category) {
  if (!category) return null;
  return category.parentId === null ? category.id : category.parentId;
}
