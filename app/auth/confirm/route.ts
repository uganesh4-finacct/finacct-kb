import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Auth callback for password reset. Supabase sends user here with ?token_hash=...&type=recovery.
 * We verify the OTP (sets session cookies) then redirect to /update-password.
 * Session cookies must be set on the redirect response so the client receives them.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const { searchParams } = url

  console.log('[auth/confirm] FULL URL received:', request.url)
  const allParams: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    allParams[key] = key === 'token_hash' ? `${value.slice(0, 8)}...(${value.length} chars)` : value
  })
  console.log('[auth/confirm] ALL query params:', JSON.stringify(allParams))

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!token_hash || type !== 'recovery') {
    console.log('[auth/confirm] REDIRECT to /login — reason: missing token_hash or type !== recovery', { token_hashPresent: !!token_hash, type })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // No-op: we pass session via URL hash to /update-password instead of cookies
        },
      },
    }
  )

  console.log('[auth/confirm] BEFORE verifyOtp')
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'recovery',
  })
  console.log('[auth/confirm] AFTER verifyOtp — full response:', {
    error: error ? { message: error.message, name: error.name } : null,
    dataSession: data?.session ? { userId: data.session.user?.id, email: data.session.user?.email } : null,
  })

  if (error) {
    console.error('[auth/confirm] REDIRECT to /login — reason: verifyOtp error:', error.message)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
  }

  const session = data?.session ?? (await supabase.auth.getSession()).data?.session
  if (!session?.access_token || !session?.refresh_token) {
    console.error('[auth/confirm] REDIRECT to /login — reason: no session tokens after verifyOtp')
    return NextResponse.redirect(new URL('/login?error=session_not_created', request.url))
  }

  const redirectUrl = new URL('/update-password', request.url)
  redirectUrl.hash = `access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&type=recovery`
  console.log('[auth/confirm] REDIRECT to /update-password with tokens in hash')
  return NextResponse.redirect(redirectUrl.toString())
}
