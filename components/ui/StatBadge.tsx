'use client'

import type { LucideIcon } from 'lucide-react'

interface StatBadgeProps {
  icon: LucideIcon
  value: string
  label: string
}

export function StatBadge({ icon: Icon, value, label }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/30 border border-slate-800/50">
      <Icon className="w-5 h-5 text-slate-400 shrink-0" />
      <div>
        <div className="text-base font-semibold text-white leading-tight">{value}</div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}
