-- Add is_pinned to kb_articles for pinned-article support
ALTER TABLE public.kb_articles
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
