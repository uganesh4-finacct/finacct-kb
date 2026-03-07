'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface QuickAccessCardProps {
  title: string
  href: string
  description?: string
  meta?: string
  icon: LucideIcon
  iconClassName?: string
}

export function QuickAccessCard({
  title,
  href,
  description,
  meta,
  icon: Icon,
  iconClassName = 'text-slate-400',
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 hover:border-slate-600 transition-colors flex items-start gap-3 group"
    >
      <div className={`p-2 rounded-lg bg-slate-700/50 shrink-0 group-hover:bg-slate-700/70 ${iconClassName}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-medium text-white group-hover:text-slate-200">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{description}</p>
        )}
        {meta && (
          <p className="text-xs text-slate-500 mt-1">{meta}</p>
        )}
      </div>
    </Link>
  )
}
