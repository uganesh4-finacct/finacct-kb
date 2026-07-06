-- Editor article CRUD: allow INSERT/UPDATE/SELECT but not DELETE on kb_articles.
-- Editors can INSERT/SELECT on kb_article_versions (no UPDATE/DELETE).
-- Editors can SELECT all kb_sections (read-only for article assignment).
-- Run after 20250310000000_add_editor_role_for_kb.sql.

-- kb_articles: replace blanket FOR ALL policy with granular policies
DROP POLICY IF EXISTS "Admins and editors can manage articles" ON public.kb_articles;

CREATE POLICY "Admins and editors can view all articles" ON public.kb_articles
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins and editors can insert articles" ON public.kb_articles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins and editors can update articles" ON public.kb_articles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can delete articles" ON public.kb_articles
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- kb_article_versions: SELECT + INSERT only (no client UPDATE/DELETE)
DROP POLICY IF EXISTS "Admins and editors can manage article versions" ON public.kb_article_versions;

CREATE POLICY "Admins and editors can view article versions" ON public.kb_article_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins and editors can insert article versions" ON public.kb_article_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- kb_sections: editors need read access to all sections for article assignment
DROP POLICY IF EXISTS "Editors can view all sections" ON public.kb_sections;
CREATE POLICY "Editors can view all sections" ON public.kb_sections
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );
