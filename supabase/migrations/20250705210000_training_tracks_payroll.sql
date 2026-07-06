-- Training tracks + payroll track tagging + quiz question variants for retakes.
-- Idempotent.

CREATE TABLE IF NOT EXISTS public.training_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  track_number integer NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_modules
  ADD COLUMN IF NOT EXISTS track_id uuid REFERENCES public.training_tracks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS module_code text;

CREATE INDEX IF NOT EXISTS idx_training_modules_track ON public.training_modules(track_id);

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS variant_group text;

COMMENT ON COLUMN public.training_modules.module_code IS 'Track module label e.g. 4.1, 4.2';
COMMENT ON COLUMN public.quiz_questions.variant_group IS 'When set, prepareQuiz picks one random question per group for retake variety';

INSERT INTO public.training_tracks (slug, title, description, track_number, order_index, is_published)
VALUES (
  'payroll',
  'Payroll for Restaurants',
  'Wages, tips, overtime, payroll registers, and payroll in the weekly close',
  4,
  3,
  false
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    track_number = EXCLUDED.track_number,
    order_index = EXCLUDED.order_index;
