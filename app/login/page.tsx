'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { BookOpen } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/home'
  const message = searchParams.get('message')
  const errorParam = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(errorParam === 'invalid_reset_link' ? 'Reset link invalid or expired. Request a new one.' : null)
  const [loading, setLoading] = useState(false)

  // If we landed here with an invite hash, send to accept-invite (full page nav so mobile keeps hash).
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    if (params.get('access_token') || params.get('type') === 'invite') {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      window.location.replace(`${base}/auth/accept-invite${hash ? `#${hash.replace(/^#/, '')}` : ''}`)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials' ? 'Invalid email or password.' : signInError.message)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/20 p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-indigo-100">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">FinAcct360 Academy</h1>
            <p className="text-sm text-slate-500">FinAcct360 Internal</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Sign in</h2>
        {message && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 transition"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/reset-password" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Forgot password?
          </Link>
        </p>
      </div>
      <p className="mt-8 text-center text-slate-500 text-sm">
        Internal use only • FinAcct Solutions
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Suspense fallback={<div className="w-full max-w-md rounded-2xl bg-white/5 animate-pulse h-96" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
