'use client'

import type { UserRole } from '@/lib/types'

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  accountant: 'bg-green-500/20 text-green-300 border-green-500/40',
  trainee: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
}

export function RoleBadge({ role }: { role: UserRole }) {
  const label = role === 'accountant' ? 'Accountant' : role.charAt(0).toUpperCase() + role.slice(1)
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${ROLE_STYLES[role] ?? 'bg-slate-500/20 text-slate-300'}`}
    >
      {label}
    </span>
  )
}
