'use client'

import type { Profile, UserRole } from '@/lib/types'
import { RoleBadge } from './RoleBadge'
import { Pencil, Trash2 } from 'lucide-react'

export type UserStatus = 'Active' | 'Invited' | 'Disabled'

function getStatus(p: Profile): UserStatus {
  if (p.is_active === false) return 'Disabled'
  if (p.invited_at && !p.last_active_at) return 'Invited'
  return 'Active'
}

const STATUS_STYLES: Record<UserStatus, string> = {
  Active: 'text-green-400',
  Invited: 'text-amber-400',
  Disabled: 'text-slate-500',
}

interface UserTableProps {
  profiles: Profile[]
  quizStats: Record<string, { avgScore: number; failedCount: number }>
  onEdit: (profile: Profile) => void
  onDelete: (profile: Profile) => void
  deleteConfirmId: string | null
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
}

export function UserTable({
  profiles,
  quizStats,
  onEdit,
  onDelete,
  deleteConfirmId,
  onConfirmDelete,
  onCancelDelete,
}: UserTableProps) {
  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-800/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="px-4 py-3 text-sm font-semibold text-slate-300">Name</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-300">Email</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-300">Role</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-300">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-300">Training</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-300">Last Active</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-300 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const status = getStatus(p)
              const stats = quizStats[p.id]
              return (
                <tr key={p.id} className="border-b border-slate-800/50/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{p.full_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{p.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={p.role as UserRole} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_STYLES[status]}>{status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {p.role === 'trainee' ? (
                      stats ? (
                        <span>{p.training_completed ? 'Completed' : 'In progress'} · {stats.avgScore}% avg</span>
                      ) : (
                        p.training_completed ? 'Completed' : 'In progress'
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm">
                    {p.last_active_at
                      ? new Date(p.last_active_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onConfirmDelete(p.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={onCancelDelete}
                          className="text-slate-400 hover:text-white text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
