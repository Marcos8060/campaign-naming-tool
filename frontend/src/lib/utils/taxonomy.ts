// Taxonomy "Category" (the `type` column/field) used to be locked to 6
// hardcoded values. Now it's user-defined — an admin can type any category
// name (e.g. "Audience") when creating a taxonomy node. But that raw string
// also gets used verbatim as a {type} placeholder in platform naming
// templates, and is validated server-side against
// backend/src/api/v1/endpoints/taxonomies.py's `_CATEGORY_TYPE_RE`
// (^[a-z][a-z0-9_]*$, matching the DB CHECK constraint from migration 019).
// This normalizes whatever a user types into that exact safe format before
// it's ever sent, so "Audience", "audience ", or "Ad Audience!" all become
// a valid, predictable slug instead of failing validation or silently never
// matching a template placeholder.
export function slugifyCategory(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!slug) return '';
  return /^[a-z]/.test(slug) ? slug : `c_${slug}`;
}
