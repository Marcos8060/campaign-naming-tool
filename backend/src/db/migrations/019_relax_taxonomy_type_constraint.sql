-- taxonomies.type ("Category" in the UI — see frontend label rename) was
-- previously locked to 6 hardcoded values via a CHECK ... IN (...)
-- constraint (Postgres auto-named it taxonomies_type_check). Workspaces
-- need to define their own categories (e.g. "audience", "placement")
-- without a code change or migration every time, so this replaces the
-- fixed list with a format check instead.
--
-- This isn't just relaxing validation for its own sake: taxonomy `type`
-- values are used directly as {type} placeholders in platform naming
-- templates (see the naming engine in campaigns/create/page.tsx), so
-- keeping them restricted to lowercase letters/digits/underscores, starting
-- with a letter, is what keeps that placeholder matching
-- (\{[a-zA-Z0-9_]+\}) reliable — free-form text with spaces or symbols
-- would silently never match a template placeholder.
--
-- Existing values (brand, product, region, objective, promotion, custom)
-- already satisfy this format, so no data changes are needed.
ALTER TABLE taxonomies DROP CONSTRAINT IF EXISTS taxonomies_type_check;
ALTER TABLE taxonomies ADD CONSTRAINT taxonomies_type_check
  CHECK (type ~ '^[a-z][a-z0-9_]*$');
