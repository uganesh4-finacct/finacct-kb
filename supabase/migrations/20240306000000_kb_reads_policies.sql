-- Allow admins to read kb_reads for dashboard stats
CREATE POLICY "Admins can view reads" ON public.kb_reads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow authenticated users to insert their own read (for tracking)
CREATE POLICY "Users can insert own read" ON public.kb_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users who completed training to insert their own certificate
CREATE POLICY "Users can insert own certificate" ON public.certificates
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND training_completed = TRUE)
  );
