-- Add quiz retry lock to training_progress (after 3 failed attempts, lock for 24h)
ALTER TABLE public.training_progress
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

COMMENT ON COLUMN public.training_progress.next_retry_at IS 'When quiz is locked after 3 failed attempts; NULL when not locked.';
