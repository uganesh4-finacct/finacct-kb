-- COA template accounts for in-page expandable view.
-- Restaurant types: cafe, fsr, bar, qsr, fine_dining, multi_unit

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
