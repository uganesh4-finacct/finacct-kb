'use client'

import { useState } from 'react'
import type { Profile, UserRole } from '@/lib/types'

const ROLE_OPTIONS: UserRole[] = ['trainee', 'accountant', 'admin']

interface EditUserModalProps {
  profile: Profile
  onClose: () => void
  onSave: (userId: string, updates: { full_name?: string; role?: UserRole; is_active?: boolean }) => Promise<{ ok: boolean; error?: string }>
  onResetPassword: (userId: string) => Promise<{ ok: boolean; error?: string; tempPassword?: string }>
  onCredentialsShown: (email: string, tempPassword: string, userName?: string) => void
}

export function EditUserModal({
  profile,
  onClose,
  onSave,
  onResetPassword,
  onCredentialsShown,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [role, setRole] = useState<UserRole>(profile.role as UserRole)
  const [isActive, setIsActive] = useState(profile.is_active !== false)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await onSave(profile.id, {
      full_name: fullName.trim() || undefined,
      role,
      is_active: isActive,
    })
    setLoading(false)
    if (res.ok) {
      onClose()
    } else {
      setError(res.error ?? 'Failed to update.')
    }
  }

  async function handleResetPassword() {
    setError(null)
    setResetLoading(true)
    const res = await onResetPassword(profile.id)
    setResetLoading(false)
    if (res.ok && res.tempPassword) {
      onCredentialsShown(profile.email, res.tempPassword, fullName || undefined)
    } else {
      setError(res.error ?? 'Failed to reset password.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="rounded-xl bg-slate-800 border border-slate-800/50 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white">Edit User</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <p className="text-slate-400 text-sm py-1">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="edit-active" className="text-sm text-slate-300">Account enabled</label>
          </div>
          <div className="pt-2 border-t border-slate-800/50">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="text-sm text-amber-400 hover:text-amber-300 disabled:opacity-60"
            >
              {resetLoading ? 'Resetting…' : 'Generate new temporary password'}
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
