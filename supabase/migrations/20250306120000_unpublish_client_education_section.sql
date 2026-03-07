-- Hide Client Education section from sidebar and navigation.
-- Content remains in the database for future use.
UPDATE public.kb_sections
SET is_published = false, updated_at = NOW()
WHERE slug = 'client-education';
