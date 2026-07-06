'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Clears needs_password_set for the current user (after they set their password).
 * Called from the update-password page after successful updateUser().
 */
export async function clearNeedsPasswordSet(): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: true }
    const { error } = await supabase
      .from('profiles')
      .update({ needs_password_set: false, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (error) {
      console.error('[clearNeedsPasswordSet] profiles update error:', { message: error.message, code: error.code, details: error.details })
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    const obj = err as Error & { cause?: unknown }
    console.error('[clearNeedsPasswordSet] unexpected error:', {
      message: obj?.message,
      name: obj?.name,
      cause: obj?.cause,
    })
    return { ok: false, error: obj?.message ?? 'Failed to update profile' }
  }
}
