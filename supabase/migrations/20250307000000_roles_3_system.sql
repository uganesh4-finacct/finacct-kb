-- Simplify roles: 4 → 3 (remove editor, rename reader → accountant)
-- Run this migration after deploying the app changes.
--
-- Optional: sync auth.users metadata (run as superuser if desired):
-- UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'), '{role}', '"accountant"') WHERE raw_user_meta_data->>'role' = 'reader';
-- UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'), '{role}', '"admin"') WHERE raw_user_meta_data->>'role' = 'editor';

-- 1. Migrate existing data: reader → accountant, editor → admin
UPDATE public.profiles SET role = 'accountant' WHERE role = 'reader';
UPDATE public.profiles SET role = 'admin' WHERE role = 'editor';

-- 2. Update role constraint to allow only admin, accountant, trainee
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'accountant', 'trainee'));

-- 3. Auto-upgrade: trainee completes all modules → accountant (was reader)
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

-- 4. RLS: merge editor into admin (only admin can manage content)
-- Sections: admin only
DROP POLICY IF EXISTS "Admins and editors can manage sections" ON public.kb_sections;
CREATE POLICY "Admins can manage sections" ON public.kb_sections 
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Articles: admin only for write
DROP POLICY IF EXISTS "Admins and editors can manage articles" ON public.kb_articles;
CREATE POLICY "Admins can manage articles" ON public.kb_articles 
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Training modules: admin only
DROP POLICY IF EXISTS "Admins and editors can manage training modules" ON public.training_modules;
CREATE POLICY "Admins can manage training modules" ON public.training_modules 
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Quiz questions: admin only
DROP POLICY IF EXISTS "Admins and editors can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions 
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Article versions: admin only (policy name may vary)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kb_article_versions' AND policyname LIKE '%editor%') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins and editors can manage article versions" ON public.kb_article_versions';
    EXECUTE 'CREATE POLICY "Admins can manage article versions" ON public.kb_article_versions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin''))';
  END IF;
END $$;

-- 5. Article read policy: trained or admin (accountant has training_completed)
DROP POLICY IF EXISTS "Trained users can view published articles" ON public.kb_articles;
CREATE POLICY "Trained users can view published articles" ON public.kb_articles 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_published = TRUE AND (
      EXISTS (SELECT 1 FROM public.kb_sections WHERE id = section_id AND is_training_section = TRUE)
      OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (training_completed = TRUE OR role = 'admin'))
    )
  );

-- 6. Training progress / quiz attempts: only admin can view all
DROP POLICY IF EXISTS "Admins can view all progress" ON public.training_progress;
CREATE POLICY "Admins can view all progress" ON public.training_progress 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
