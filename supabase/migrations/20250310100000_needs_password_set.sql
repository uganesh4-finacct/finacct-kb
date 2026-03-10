-- Invited users must set a password before using the app. This flag is set when inviting
-- and cleared when they complete the set-password page.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS needs_password_set BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.needs_password_set IS 'True for users invited by email until they set a password; middleware redirects them to /update-password.';

-- Optional: for users invited before this migration, force them to set password on next visit:
-- UPDATE public.profiles SET needs_password_set = true WHERE email = 'trainee@example.com';
