-- Add columns for parent/child hierarchy and KPI mapping
ALTER TABLE coa_template_accounts
ADD COLUMN IF NOT EXISTS parent_account_number TEXT,
ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS kpi_mapping TEXT;

-- Index for hierarchy queries
CREATE INDEX IF NOT EXISTS idx_coa_parent ON coa_template_accounts(parent_account_number);
