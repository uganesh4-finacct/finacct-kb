-- Allow users to view their own kb_reads (for "Recently Viewed" in KB)
CREATE POLICY "Users can view own reads" ON public.kb_reads
  FOR SELECT USING (auth.uid() = user_id);
