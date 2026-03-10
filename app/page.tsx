'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

/**
 * Root page: if URL has invite/recovery hash (from Supabase redirect), send to the right handler.
 * Otherwise redirect to /home or /login based on session.
 */
export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    const type = params.get('type')

    // Supabase often redirects to Site URL (/) with hash; preserve it and send to accept-invite.
    // Use full page navigation so mobile browsers keep the hash (router.replace can drop it).
    if (accessToken || type === 'invite') {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const path = `/auth/accept-invite${hash ? `#${hash.replace(/^#/, '')}` : ''}`
      if (typeof window !== 'undefined') {
        window.location.replace(base + path)
      } else {
        router.replace(path)
      }
      return
    }

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? '/home' : '/login')
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <p className="text-slate-400">Loading…</p>
    </div>
  )
}
