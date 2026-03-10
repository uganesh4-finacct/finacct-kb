'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

/**
 * Accept-invite landing page. Supabase redirects here after the user clicks the invite link,
 * with hash #access_token=...&refresh_token=...&type=invite. We let the client establish the
 * session from the hash, then redirect to /update-password so they can set their password.
 */
export default function AcceptInvitePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'redirect' | 'login'>('loading')

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (!accessToken && type !== 'invite') {
      router.replace('/login')
      return
    }

    async function establishAndRedirect() {
      const supabase = createClient()
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error) {
          router.replace('/login?error=invalid_reset_link')
          return
        }
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('redirect')
        // Full page nav so cookies are applied before update-password loads (helps on mobile)
        if (typeof window !== 'undefined') {
          window.location.replace(`${window.location.origin}/update-password`)
        } else {
          router.replace('/update-password')
        }
      } else {
        setStatus('login')
        router.replace('/login')
      }
    }

    establishAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <p className="text-slate-400">
        {status === 'loading' && 'Setting up your account…'}
        {(status === 'redirect' || status === 'login') && 'Taking you to sign in…'}
      </p>
    </div>
  )
}
