-- Add modules_completed to certificates so the certificate page and PDF show the correct count
-- (number of distinct modules the user passed at the time of certification).
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS modules_completed INTEGER;

COMMENT ON COLUMN public.certificates.modules_completed IS 'Number of training modules passed when certificate was issued; used for certificate display and PDF.';
