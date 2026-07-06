-- FCRA certification gates: human-gated promotion replaces auto trainee → accountant upgrade.
-- Idempotent: safe to re-run.

-- 1. certification_gates table
CREATE TABLE IF NOT EXISTS public.certification_gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gate text NOT NULL CHECK (gate IN ('G1','G2','G3','G4','G5','G6')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','passed')),
  signed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  signed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, gate)
);

CREATE INDEX IF NOT EXISTS idx_certification_gates_user ON public.certification_gates(user_id);
CREATE INDEX IF NOT EXISTS idx_certification_gates_status ON public.certification_gates(user_id, status);

ALTER TABLE public.certification_gates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own certification gates" ON public.certification_gates;
CREATE POLICY "Users can view own certification gates" ON public.certification_gates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all certification gates" ON public.certification_gates;
CREATE POLICY "Admins can view all certification gates" ON public.certification_gates
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert certification gates" ON public.certification_gates;
CREATE POLICY "Admins can insert certification gates" ON public.certification_gates
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update certification gates" ON public.certification_gates;
CREATE POLICY "Admins can update certification gates" ON public.certification_gates
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role / migrations may insert G1 auto-pass rows; allow insert for own G1 only via trigger below is app-side.
-- G1 auto-upsert uses admin client or runs in migration; app uses service patterns via server with user session for reads.

-- 2. Remove auto-promotion trigger (trainee → accountant on quiz pass)
DROP TRIGGER IF EXISTS on_quiz_passed ON public.quiz_attempts;

-- Replace upgrade_to_reader: no role change; keep function for compatibility but no-op
CREATE OR REPLACE FUNCTION public.upgrade_to_reader()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-promotion removed. G1+ gates handled in application layer.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Backfill G1 for users who already passed all published training module quizzes (≥80%)
INSERT INTO public.certification_gates (user_id, gate, status, signed_at, notes)
SELECT p.id, 'G1', 'passed', NOW(), 'Backfilled — coursework complete before gate system'
FROM public.profiles p
WHERE EXISTS (
  SELECT 1
  FROM public.training_modules tm
  WHERE tm.is_published = TRUE
)
AND NOT EXISTS (
  SELECT 1
  FROM public.training_modules tm
  WHERE tm.is_published = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM public.quiz_attempts qa
    WHERE qa.user_id = p.id
      AND qa.module_id = tm.id
      AND qa.passed = TRUE
  )
)
ON CONFLICT (user_id, gate) DO UPDATE
SET status = 'passed',
    signed_at = COALESCE(public.certification_gates.signed_at, EXCLUDED.signed_at),
    notes = COALESCE(public.certification_gates.notes, EXCLUDED.notes)
WHERE public.certification_gates.status = 'pending';

-- 4. Grandfather existing accountants: all 6 gates passed (do not change role)
INSERT INTO public.certification_gates (user_id, gate, status, signed_at, notes)
SELECT p.id, g.gate, 'passed', COALESCE(p.training_completed_at, p.created_at, NOW()),
       'Grandfathered - certified before gate system'
FROM public.profiles p
CROSS JOIN (VALUES ('G1'),('G2'),('G3'),('G4'),('G5'),('G6')) AS g(gate)
WHERE p.role = 'accountant'
ON CONFLICT (user_id, gate) DO UPDATE
SET status = 'passed',
    notes = COALESCE(public.certification_gates.notes, EXCLUDED.notes)
WHERE public.certification_gates.status = 'pending';

-- 5. SECURITY DEFINER: auto-pass G1 when all published module quizzes are passed
CREATE OR REPLACE FUNCTION public.auto_pass_g1_if_eligible(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_total int;
  v_passed int;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM public.training_modules WHERE is_published = TRUE;

  IF v_total = 0 THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(DISTINCT qa.module_id) INTO v_passed
  FROM public.quiz_attempts qa
  INNER JOIN public.training_modules tm ON tm.id = qa.module_id AND tm.is_published = TRUE
  WHERE qa.user_id = p_user_id AND qa.passed = TRUE;

  IF v_passed < v_total THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.certification_gates (user_id, gate, status, signed_by, signed_at, notes)
  VALUES (p_user_id, 'G1', 'passed', NULL, NOW(), 'Automatic — all training quizzes passed')
  ON CONFLICT (user_id, gate) DO UPDATE
  SET status = 'passed',
      signed_at = COALESCE(public.certification_gates.signed_at, EXCLUDED.signed_at),
      notes = COALESCE(public.certification_gates.notes, EXCLUDED.notes)
  WHERE public.certification_gates.status = 'pending';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.auto_pass_g1_if_eligible(uuid) TO authenticated;

-- 6. Certificate insert: allow when all six gates passed (or legacy training_completed)
DROP POLICY IF EXISTS "Users can insert own certificate" ON public.certificates;
CREATE POLICY "Users can insert own certificate" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND training_completed = TRUE
      )
      OR (
        SELECT COUNT(*) = 6
        FROM public.certification_gates cg
        WHERE cg.user_id = auth.uid() AND cg.status = 'passed'
      )
    )
  );
