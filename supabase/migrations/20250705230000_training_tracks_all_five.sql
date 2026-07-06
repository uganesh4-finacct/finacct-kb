-- All five training tracks (idempotent).
-- Foundations, QBO, Platform: upsert canonical metadata.
-- POS, Payroll: insert only if missing (preserve rows from 20250705210000 / 20250705220000).

INSERT INTO public.training_tracks (slug, title, description, track_number, order_index, is_published)
VALUES
  (
    'foundations',
    'Foundations',
    'US restaurant industry, roles, finances, and KPI fundamentals',
    1,
    1,
    true
  ),
  (
    'qbo',
    'QBO for Restaurants',
    'Restaurant accounting basics, chart of accounts, P&L reading, and QBO Essentials',
    2,
    2,
    true
  ),
  (
    'platform',
    'The FinAcct360 Platform',
    'Weekly close process and common mistakes on the FinAcct360 platform',
    5,
    5,
    true
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    track_number = EXCLUDED.track_number,
    order_index = EXCLUDED.order_index,
    is_published = EXCLUDED.is_published;

INSERT INTO public.training_tracks (slug, title, description, track_number, order_index, is_published)
VALUES
  (
    'pos',
    'POS & Reconciliation',
    'Square, Toast, Clover, tech stack, and POS reconciliation',
    3,
    3,
    true
  ),
  (
    'payroll',
    'Payroll',
    'Wages, tips, overtime, payroll registers, and payroll in the weekly close',
    4,
    4,
    false
  )
ON CONFLICT (slug) DO NOTHING;
