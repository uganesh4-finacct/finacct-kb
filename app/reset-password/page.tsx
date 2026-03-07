'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { BookOpen, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`,
    })
    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/20 p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-indigo-100">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Knowledge Base</h1>
              <p className="text-sm text-slate-500">FinAcct360 Internal</p>
            </div>
          </div>
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Check your email</h2>
              <p className="text-slate-600 mb-6">
                If an account exists for <strong>{email}</strong>, we’ve sent a link to reset your password.
              </p>
              <Link
                href="/login"
                className="inline-block py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Reset password</h2>
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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
        <p className="mt-8 text-center text-slate-500 text-sm">
          Internal use only • FinAcct Solutions
        </p>
      </div>
    </div>
  )
}
