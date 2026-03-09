-- =============================================
-- FINACCT KNOWLEDGE BASE - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'trainee' CHECK (role IN ('admin', 'accountant', 'trainee')),
  training_completed BOOLEAN DEFAULT FALSE,
  training_completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. SECTIONS TABLE
-- =============================================
CREATE TABLE public.kb_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'fa-folder',
  color TEXT DEFAULT 'blue',
  gradient TEXT DEFAULT 'from-blue-500 to-blue-600',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  is_training_section BOOLEAN DEFAULT FALSE,
  requires_training BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. ARTICLES TABLE
-- =============================================
CREATE TABLE public.kb_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID REFERENCES public.kb_sections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB, -- TipTap JSON content
  excerpt TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_protected BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  author TEXT DEFAULT 'FinAcct Controller',
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, slug)
);

-- =============================================
-- 4. ARTICLE VERSIONS (History)
-- =============================================
CREATE TABLE public.kb_article_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE NOT NULL,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  saved_by UUID REFERENCES public.profiles(id),
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. TRAINING MODULES TABLE
-- =============================================
CREATE TABLE public.training_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content JSONB, -- TipTap JSON content
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. QUIZ QUESTIONS TABLE
-- =============================================
CREATE TABLE public.quiz_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id, text} objects
  correct_option_id TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. USER TRAINING PROGRESS
-- =============================================
CREATE TABLE public.training_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, module_id)
);

-- =============================================
-- 8. QUIZ ATTEMPTS
-- =============================================
CREATE TABLE public.quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(5,2) NOT NULL, -- Percentage score
  passed BOOLEAN NOT NULL,
  answers JSONB, -- {question_id: selected_option_id}
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  attempt_number INTEGER DEFAULT 1
);

-- =============================================
-- 9. ARTICLE READS (Analytics)
-- =============================================
CREATE TABLE public.kb_reads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. CERTIFICATES TABLE
-- =============================================
CREATE TABLE public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  average_score DECIMAL(5,2),
  total_time_spent_seconds INTEGER,
  modules_completed INTEGER
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sections policies
CREATE POLICY "Anyone authenticated can view published sections" ON public.kb_sections 
  FOR SELECT USING (auth.role() = 'authenticated' AND is_published = TRUE);
CREATE POLICY "Admins can manage sections" ON public.kb_sections 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Articles policies
CREATE POLICY "Trained users can view published articles" ON public.kb_articles 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_published = TRUE AND (
      -- Training section articles visible to all
      EXISTS (SELECT 1 FROM public.kb_sections WHERE id = section_id AND is_training_section = TRUE)
      OR
      -- Non-training articles only for trained users
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (training_completed = TRUE OR role = 'admin'))
    )
  );
CREATE POLICY "Admins can manage articles" ON public.kb_articles 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Training modules policies
CREATE POLICY "Anyone authenticated can view training modules" ON public.training_modules 
  FOR SELECT USING (auth.role() = 'authenticated' AND is_published = TRUE);
CREATE POLICY "Admins can manage training modules" ON public.training_modules 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Quiz questions policies
CREATE POLICY "Anyone authenticated can view quiz questions" ON public.quiz_questions 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Training progress policies
CREATE POLICY "Users can manage own progress" ON public.training_progress 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.training_progress 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Quiz attempts policies
CREATE POLICY "Users can manage own attempts" ON public.quiz_attempts 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Certificates policies
CREATE POLICY "Users can view own certificate" ON public.certificates 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'trainee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user passed all training
CREATE OR REPLACE FUNCTION public.check_training_completion(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_modules INTEGER;
  passed_modules INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_modules FROM public.training_modules WHERE is_published = TRUE;
  
  SELECT COUNT(DISTINCT module_id) INTO passed_modules 
  FROM public.quiz_attempts 
  WHERE user_id = user_uuid AND passed = TRUE;
  
  RETURN passed_modules >= total_modules;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade trainee to accountant after completing all training
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

-- Trigger to auto-upgrade users
DROP TRIGGER IF EXISTS on_quiz_passed ON public.quiz_attempts;
CREATE TRIGGER on_quiz_passed
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.upgrade_to_reader();

-- Function to notify editor on failed quiz (3+ attempts)
CREATE OR REPLACE FUNCTION public.check_quiz_failures()
RETURNS TRIGGER AS $$
DECLARE
  failure_count INTEGER;
BEGIN
  IF NEW.passed = FALSE THEN
    SELECT COUNT(*) INTO failure_count 
    FROM public.quiz_attempts 
    WHERE user_id = NEW.user_id AND module_id = NEW.module_id AND passed = FALSE;
    
    -- Could integrate with email service here
    -- For now, we'll just track it in the database
    IF failure_count >= 3 THEN
      -- Log or notify (implement based on notification system)
      RAISE NOTICE 'User % has failed module % three times', NEW.user_id, NEW.module_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quiz_failure ON public.quiz_attempts;
CREATE TRIGGER on_quiz_failure
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.check_quiz_failures();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_articles_section ON public.kb_articles(section_id);
CREATE INDEX idx_articles_slug ON public.kb_articles(slug);
CREATE INDEX idx_progress_user ON public.training_progress(user_id);
CREATE INDEX idx_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_reads_user ON public.kb_reads(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_training ON public.profiles(training_completed);
