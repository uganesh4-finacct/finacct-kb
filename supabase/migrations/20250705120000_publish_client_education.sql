-- Publish Client Education section for sidebar and navigation.
UPDATE public.kb_sections
SET is_published = true, updated_at = NOW()
WHERE slug = 'client-education';
