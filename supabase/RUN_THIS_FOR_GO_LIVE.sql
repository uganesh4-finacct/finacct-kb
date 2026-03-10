-- =============================================================================
-- FinAcct360 Go-Live: Run this ONCE in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run if some parts were already applied (uses IF NOT EXISTS / DROP IF EXISTS).
--
-- BEFORE RUNNING:
-- 1. In Supabase Dashboard → Authentication → URL Configuration:
--    - Add Redirect URL: https://YOUR_VERCEL_DOMAIN/auth/confirm (and http://localhost:3002/auth/confirm for dev)
--    - Add Redirect URL: https://YOUR_VERCEL_DOMAIN/update-password (and http://localhost:3002/update-password for dev)
-- 2. Optional: In Authentication → Email Templates → "Reset Password", set the link to use query params:
--    {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
--    (Some Supabase versions use this; if the default template already appends token_hash to redirectTo, you may not need to change it.)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. kb_reads policies (20240306)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view reads" ON public.kb_reads;
CREATE POLICY "Admins can view reads" ON public.kb_reads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert own read" ON public.kb_reads;
CREATE POLICY "Users can insert own read" ON public.kb_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own certificate" ON public.certificates;
CREATE POLICY "Users can insert own certificate" ON public.certificates
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND training_completed = TRUE)
  );

-- -----------------------------------------------------------------------------
-- 2. Users can view own reads (20250306100000)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own reads" ON public.kb_reads;
CREATE POLICY "Users can view own reads" ON public.kb_reads
  FOR SELECT USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. is_pinned on kb_articles (20250306110000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.kb_articles
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- -----------------------------------------------------------------------------
-- 4. Unpublish Client Education section (20250306120000)
-- -----------------------------------------------------------------------------
UPDATE public.kb_sections
SET is_published = false, updated_at = NOW()
WHERE slug = 'client-education';

-- -----------------------------------------------------------------------------
-- 5. COA template accounts table (20250306130000)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coa_template_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_type TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  qbo_account_type TEXT NOT NULL,
  qbo_detail_type TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coa_template_type ON public.coa_template_accounts(restaurant_type);

ALTER TABLE public.coa_template_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view COA templates" ON public.coa_template_accounts;
CREATE POLICY "Authenticated users can view COA templates" ON public.coa_template_accounts
  FOR SELECT TO authenticated USING (true);

-- -----------------------------------------------------------------------------
-- 6. Roles 3-system: reader→accountant, editor→admin, upgrade trigger (20250307000000)
-- -----------------------------------------------------------------------------
UPDATE public.profiles SET role = 'accountant' WHERE role = 'reader';
UPDATE public.profiles SET role = 'admin' WHERE role = 'editor';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'accountant', 'trainee'));

CREATE OR REPLACE FUNCTION public.upgrade_to_reader()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.passed = TRUE THEN
    IF public.check_training_completion(NEW.user_id) THEN
      UPDATE public.profiles 
      SET 
        training_completed = TRUE,
        training_completed_at = NOW(),
        role = CASE WHEN role = 'trainee' THEN 'accountant' ELSE role END
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins and editors can manage sections" ON public.kb_sections;
CREATE POLICY "Admins can manage sections" ON public.kb_sections 
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins and editors can manage articles" ON public.kb_articles;
CREATE POLICY "Admins can manage articles" ON public.kb_articles 
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins and editors can manage training modules" ON public.training_modules;
CREATE POLICY "Admins can manage training modules" ON public.training_modules 
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins and editors can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions 
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins and editors can manage article versions" ON public.kb_article_versions;
CREATE POLICY "Admins can manage article versions" ON public.kb_article_versions 
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Trained users can view published articles" ON public.kb_articles;
CREATE POLICY "Trained users can view published articles" ON public.kb_articles 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_published = TRUE AND (
      EXISTS (SELECT 1 FROM public.kb_sections WHERE id = section_id AND is_training_section = TRUE)
      OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (training_completed = TRUE OR role = 'admin'))
    )
  );

DROP POLICY IF EXISTS "Admins can view all progress" ON public.training_progress;
CREATE POLICY "Admins can view all progress" ON public.training_progress 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- -----------------------------------------------------------------------------
-- 7. Quiz retry lock column (20250307100000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.training_progress
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

COMMENT ON COLUMN public.training_progress.next_retry_at IS 'When quiz is locked after 3 failed attempts; NULL when not locked.';

-- -----------------------------------------------------------------------------
-- 8. COA template hierarchy columns (20250307120000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.coa_template_accounts
  ADD COLUMN IF NOT EXISTS parent_account_number TEXT,
  ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS kpi_mapping TEXT;

CREATE INDEX IF NOT EXISTS idx_coa_parent ON public.coa_template_accounts(parent_account_number);

-- -----------------------------------------------------------------------------
-- 9. certificates.modules_completed (20250307200000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS modules_completed INTEGER;

COMMENT ON COLUMN public.certificates.modules_completed IS 'Number of training modules passed when certificate was issued; used for certificate display and PDF.';

-- -----------------------------------------------------------------------------
-- 10. Add editor role back for KB (20250310000000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'accountant', 'trainee', 'editor'));

DROP POLICY IF EXISTS "Admins can manage articles" ON public.kb_articles;
CREATE POLICY "Admins and editors can manage articles" ON public.kb_articles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));

DROP POLICY IF EXISTS "Admins can manage article versions" ON public.kb_article_versions;
CREATE POLICY "Admins and editors can manage article versions" ON public.kb_article_versions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));

DROP POLICY IF EXISTS "Trained users can view published articles" ON public.kb_articles;
CREATE POLICY "Trained users can view published articles" ON public.kb_articles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_published = TRUE AND (
      EXISTS (SELECT 1 FROM public.kb_sections WHERE id = section_id AND is_training_section = TRUE)
      OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (training_completed = TRUE OR role IN ('admin', 'editor')))
    )
  );

-- =============================================================================
-- Done. If any statement failed, check whether that object already existed
-- (e.g. policy name different) and skip or fix that section.
-- =============================================================================
