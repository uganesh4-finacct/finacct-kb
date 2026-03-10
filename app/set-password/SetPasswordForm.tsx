'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { setPasswordWithToken } from '@/app/actions/invite-email'

export function SetPasswordForm({
  token,
  email,
  fullName,
}: {
  token: string
  email: string
  fullName: string
}) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const result = await setPasswordWithToken(token, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong')
      return
    }
    setDone(true)
    router.push('/login?message=Password set. Sign in with your email and new password.')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/20 p-8">
      <div className="flex justify-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-indigo-100">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">FinAcct360 Academy</h1>
          <p className="text-sm text-slate-500">Set your password</p>
        </div>
      </div>

      {done ? (
        <p className="text-slate-600 text-center">Redirecting to sign in…</p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Create your password</h2>
          <p className="text-sm text-slate-500 mb-6">
            You were invited to FinAcct360 Academy. Set a password below to finish setting up your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1.5">Re-enter password</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition"
            >
              {loading ? 'Setting password…' : 'Set password'}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Back to sign in</Link>
      </p>
    </div>
  )
}
