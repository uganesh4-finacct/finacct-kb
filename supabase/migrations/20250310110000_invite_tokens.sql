-- One-time tokens for "set your password" links sent in our own invite email.
-- Avoids relying on Supabase redirect/hash (works on all devices).
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON public.invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON public.invite_tokens(expires_at);

ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- App uses service role in server actions to insert/select/delete; no anon access
CREATE POLICY "No anon access" ON public.invite_tokens FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.invite_tokens IS 'One-time tokens for set-password links in custom invite emails; deleted after use.';
