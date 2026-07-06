'use server'

import { createClient } from '@/lib/supabase/server'

const EDITOR_OR_ADMIN_ROLES = ['admin', 'editor'] as const

export async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated', userId: undefined as undefined }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { ok: false as const, error: 'Admin only', userId: undefined as undefined }
  return { ok: true as const, error: null, userId: user.id }
}

export async function ensureEditorOrAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated', userId: undefined as undefined }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = (profile?.role as string | undefined)?.toLowerCase()
  if (!role || !EDITOR_OR_ADMIN_ROLES.includes(role as (typeof EDITOR_OR_ADMIN_ROLES)[number])) {
    return { ok: false as const, error: 'Admin or Editor only', userId: undefined as undefined }
  }
  return { ok: true as const, error: null, userId: user.id }
}
