'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  getTeamProfiles,
  getQuizStatsByUser,
  inviteUser,
  updateUserRole,
  deleteUser,
} from '../actions'
import type { Profile } from '@/lib/types'
import type { UserRole } from '@/lib/types'
import { UserPlus, Trash2, AlertTriangle } from 'lucide-react'

const ROLE_OPTIONS: UserRole[] = ['trainee', 'accountant', 'admin']

function roleLabel(r: UserRole): string {
  return r.charAt(0).toUpperCase() + r.slice(1)
}

export default function AdminTeamPage() {
  const searchParams = useSearchParams()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [quizStats, setQuizStats] = useState<Record<string, { avgScore: number; failedCount: number }>>({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const open = searchParams.get('add') === '1'
    setModalOpen(open)
  }, [searchParams])

  useEffect(() => {
    async function load() {
      const [profRes, statsRes] = await Promise.all([getTeamProfiles(), getQuizStatsByUser()])
      if (profRes.data) setProfiles(profRes.data)
      if (statsRes.data) setQuizStats(statsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInviteError(null)
    setInviteLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await inviteUser(formData)
    setInviteLoading(false)
    if (res.ok) {
      setModalOpen(false)
      form.reset()
      const { data } = await getTeamProfiles()
      if (data) setProfiles(data)
    } else {
      setInviteError(res.error ?? 'Failed')
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    setRoleUpdating(userId)
    const res = await updateUserRole(userId, role)
    setRoleUpdating(null)
    if (res.ok) {
      setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role } : p)))
    }
  }

  async function handleDelete(userId: string) {
    const res = await deleteUser(userId)
    setDeleteConfirm(null)
    if (res.ok) {
      setProfiles((prev) => prev.filter((p) => p.id !== userId))
    } else {
      alert(res.error)
    }
  }

  if (loading) {
    return (
      <div className="text-slate-400">Loading team…</div>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="rounded-xl border border-slate-800/50 bg-slate-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Email</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Role</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Training</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Quiz Avg</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const stats = quizStats[p.id]
                const failed3Plus = stats && stats.failedCount >= 3
                return (
                  <tr key={p.id} className="border-b border-slate-800/50/50 hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{p.full_name}</span>
                      {failed3Plus && (
                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400" title="Failed quiz 3+ times">
                          <AlertTriangle className="w-3 h-3" />
                          Alert
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.role}
                        disabled={!!roleUpdating}
                        onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                        className="rounded-lg border border-slate-600 bg-slate-700 text-white text-sm px-2 py-1"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{roleLabel(r)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {p.training_completed ? (
                        <span className="text-green-400">Completed</span>
                      ) : (
                        <span>In progress</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {stats ? `${stats.avgScore}%` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="text-slate-400 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(p.id)}
                          className="text-slate-400 hover:text-red-400 transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setModalOpen(false)}>
          <div className="rounded-xl bg-slate-800 border border-slate-800/50 w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Invite user</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input name="email" type="email" required className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" placeholder="user@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full name</label>
                <input name="full_name" type="text" className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select name="role" className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white">
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{roleLabel(r)}</option>
                  ))}
                </select>
              </div>
              {inviteError && <p className="text-sm text-red-400">{inviteError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={inviteLoading} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60">
                  {inviteLoading ? 'Sending…' : 'Send invite'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
