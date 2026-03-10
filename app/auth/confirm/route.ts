import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Auth callback for password reset. Supabase sends user here with ?token_hash=...&type=recovery.
 * We verify the OTP (sets session cookies) then redirect to /update-password.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!token_hash || type !== 'recovery') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })

  if (error) {
    return NextResponse.redirect(new URL('/login?error=invalid_reset_link', request.url))
  }

  return NextResponse.redirect(new URL('/update-password', request.url))
}
