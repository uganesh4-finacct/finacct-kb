'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const TOKEN_EXPIRY_HOURS = 168 // 7 days

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { ok: false as const, error: 'Admin only' }
  return { ok: true as const }
}

/**
 * Verify a set-password token and return the user's email if valid.
 * Returns { email, fullName } or { error }.
 */
export async function getSetPasswordTokenInfo(token: string | null): Promise<
  { email: string; fullName: string } | { error: string }
> {
  if (!token?.trim()) return { error: 'Invalid or expired link' }
  if (!hasAdminClient()) return { error: 'Server configuration error' }

  const admin = createAdminClient()
  const { data: row, error } = await admin
    .from('invite_tokens')
    .select('user_id, expires_at')
    .eq('token', token.trim())
    .single()

  if (error || !row) return { error: 'Invalid or expired link' }
  if (new Date(row.expires_at) < new Date()) return { error: 'This link has expired' }

  const { data: profile } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', row.user_id)
    .single()

  if (!profile?.email) return { error: 'User not found' }

  return {
    email: profile.email,
    fullName: (profile.full_name as string) || profile.email.split('@')[0],
  }
}

/**
 * Set password using a one-time token (from our invite email link).
 * Clears the token and needs_password_set after success.
 */
export async function setPasswordWithToken(
  token: string | null,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (!token?.trim()) return { ok: false, error: 'Invalid or expired link' }
  if (!password || password.length < 6) return { ok: false, error: 'Password must be at least 6 characters' }
  if (!hasAdminClient()) return { ok: false, error: 'Server configuration error' }

  const admin = createAdminClient()
  const { data: row, error } = await admin
    .from('invite_tokens')
    .select('user_id, expires_at')
    .eq('token', token.trim())
    .single()

  if (error || !row) return { ok: false, error: 'Invalid or expired link' }
  if (new Date(row.expires_at) < new Date()) return { ok: false, error: 'This link has expired' }

  const { error: updateError } = await admin.auth.admin.updateUserById(row.user_id, { password })
  if (updateError) return { ok: false, error: updateError.message }

  await admin.from('invite_tokens').delete().eq('token', token.trim())
  await admin
    .from('profiles')
    .update({ needs_password_set: false, updated_at: new Date().toISOString() })
    .eq('id', row.user_id)

  return { ok: true }
}

/**
 * Create user and send our own invite email with a set-password link.
 * Works on all devices (no Supabase redirect/hash).
 */
export async function inviteUserWithOurEmail(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false, error: check.error }

  if (!hasAdminClient()) return { ok: false, error: 'Server not configured. Add SUPABASE_SERVICE_ROLE_KEY.' }
  if (!process.env.RESEND_API_KEY) return { ok: false, error: 'Email not configured. Add RESEND_API_KEY.' }

  const email = (formData.get('email') as string)?.trim()
  const fullName = (formData.get('full_name') as string)?.trim() || 'New User'
  const role = (formData.get('role') as string) || 'trainee'

  if (!email) return { ok: false, error: 'Email required' }

  const admin = createAdminClient()
  const tempPassword = generateToken().slice(0, 16) + 'A1!'

  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })

  if (createError) return { ok: false, error: createError.message }
  if (!userData?.user) return { ok: false, error: 'User not created' }

  await admin
    .from('profiles')
    .update({
      full_name: fullName,
      role,
      needs_password_set: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userData.user.id)

  const token = generateToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  await admin.from('invite_tokens').insert({
    user_id: userData.user.id,
    token,
    expires_at: expiresAt.toISOString(),
  })

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kb.finacct360.io'
  const setPasswordUrl = `${siteUrl.replace(/\/$/, '')}/set-password?token=${token}`

  const from = process.env.RESEND_FROM ?? 'FinAcct360 Academy <noreply@finacct360.io>'
  const { error: emailError } = await resend.emails.send({
    from,
    to: [email],
    subject: "You're invited to FinAcct360 Training & LMS",
    html: `
      <p>Hi ${fullName},</p>
      <p>Welcome to the team! You've been invited to complete your FinAcct360 Academy training.</p>
      <p>Please complete within 5 days of your start date.</p>
      <p>Click below to set your password and begin:</p>
      <p><a href="${setPasswordUrl}">Accept Invitation</a></p>
      <p>Once you finish all 13 modules, you'll receive a certificate automatically.</p>
      <p>Questions? Reply to this email or contact your manager.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">—<br>FinAcct360 Team<br><a href="${siteUrl}">kb.finacct360.io</a></p>
    `,
  })

  if (emailError) {
    return { ok: false, error: `User created but email failed: ${emailError.message}` }
  }

  revalidatePath('/admin/team')
  revalidatePath('/admin')
  return { ok: true }
}
