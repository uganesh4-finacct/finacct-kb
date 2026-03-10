'use client'

import type { UserRole } from '@/lib/types'

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  accountant: 'bg-green-500/20 text-green-300 border-green-500/40',
  editor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  trainee: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  accountant: 'Accountant',
  editor: 'Editor',
  trainee: 'Trainee',
}

export function RoleBadge({ role }: { role: UserRole }) {
  const label = ROLE_LABELS[role] ?? role
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${ROLE_STYLES[role] ?? 'bg-slate-500/20 text-slate-300'}`}
    >
      {label}
    </span>
  )
}
