-- Set all training modules to 20 minutes estimated time
UPDATE public.training_modules SET estimated_minutes = 20 WHERE estimated_minutes IS DISTINCT FROM 20;

-- Default for new rows
ALTER TABLE public.training_modules ALTER COLUMN estimated_minutes SET DEFAULT 20;
