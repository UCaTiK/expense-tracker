export const CATEGORY_COLORS = ['green', 'orange', 'purple', 'blue', 'red', 'pink', 'teal', 'coral'];

export function getCategoryColorVar(color) {
  return `var(--accent-${color || 'coral'})`;
}
