// ─── Category slugs ──────────────────────────────────────────────────────────
// Single source of truth for DB category slugs used throughout the app.
// If a slug changes in the DB, update here only.

export const CATEGORY_SLUGS = {
  SAVORY: 'epicerie-salee',
  SWEET: 'epicerie-sucree',
  DRINKS: 'boissons',
  FRESH: 'produits-frais',
} as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[keyof typeof CATEGORY_SLUGS];
