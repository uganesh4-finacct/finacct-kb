import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Server-side accept-invite: when Supabase invite link uses query params (mobile-safe).
 * Use in email template: {{ .SiteURL }}/auth/accept-invite?token_hash={{ .TokenHash }}&type=invite
 * When token_hash and type=invite are in the query, we verify and redirect to set-password.
 * When they're in the hash (default Supabase redirect), the page handles it client-side.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type === 'invite') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'invite' })
    if (error) {
      return NextResponse.redirect(new URL('/login?error=invalid_reset_link', request.url))
    }
    return NextResponse.redirect(new URL('/update-password', request.url))
  }

  return NextResponse.next()
}
