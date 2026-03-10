'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Clears needs_password_set for the current user (after they set their password).
 * Called from the update-password page after successful updateUser().
 */
export async function clearNeedsPasswordSet() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('profiles')
    .update({ needs_password_set: false, updated_at: new Date().toISOString() })
    .eq('id', user.id)
}
