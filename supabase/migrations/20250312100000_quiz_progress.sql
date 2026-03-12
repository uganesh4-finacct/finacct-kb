-- Quiz progress: in-progress quiz state so users can resume
CREATE TABLE public.quiz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  current_question_index INTEGER DEFAULT 0 NOT NULL,
  question_ids JSONB DEFAULT '[]' NOT NULL,
  answers JSONB DEFAULT '[]' NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.quiz_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quiz progress"
ON public.quiz_progress FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_quiz_progress_user ON public.quiz_progress(user_id);

COMMENT ON TABLE public.quiz_progress IS 'In-progress quiz state; deleted when quiz is completed and saved to quiz_attempts.';
