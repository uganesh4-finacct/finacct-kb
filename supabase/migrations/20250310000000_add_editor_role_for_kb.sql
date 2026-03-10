-- Add 'editor' role for KB inline editing (e.g. Rajiv). Editors can update articles and save versions.
-- Run after 20250307000000_roles_3_system.sql.

-- 1. Allow 'editor' in profiles.role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'accountant', 'trainee', 'editor'));

-- 2. Articles: admin or editor can manage (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage articles" ON public.kb_articles;
CREATE POLICY "Admins and editors can manage articles" ON public.kb_articles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- 3. Article versions: admin or editor can insert/select (for version history)
DROP POLICY IF EXISTS "Admins can manage article versions" ON public.kb_article_versions;
CREATE POLICY "Admins and editors can manage article versions" ON public.kb_article_versions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- 4. Article read: editor can also view published articles (same as trained users)
DROP POLICY IF EXISTS "Trained users can view published articles" ON public.kb_articles;
CREATE POLICY "Trained users can view published articles" ON public.kb_articles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_published = TRUE AND (
      EXISTS (SELECT 1 FROM public.kb_sections WHERE id = section_id AND is_training_section = TRUE)
      OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (training_completed = TRUE OR role IN ('admin', 'editor')))
    )
  );
