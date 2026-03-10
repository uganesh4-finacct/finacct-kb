import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Server-side accept-invite (query params, works on all devices including mobile).
 * Use in Supabase invite email template:
 *   {{ .SiteURL }}/auth/accept-invite/confirm?token_hash={{ .TokenHash }}&type=invite
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!token_hash || type !== 'invite') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'invite' })
  if (error) {
    return NextResponse.redirect(new URL('/login?error=invalid_reset_link', request.url))
  }
  return NextResponse.redirect(new URL('/update-password', request.url))
}
