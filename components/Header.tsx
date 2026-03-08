'use client'

import { Search, Menu } from 'lucide-react'
import { UserMenu } from './UserMenu'
import type { UserRole } from '@/lib/types'

interface HeaderProps {
  email: string
  fullName: string | null
  role: UserRole
  sidebarCollapsed?: boolean
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Header({ email, fullName, role, onMenuClick, showMenuButton }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-slate-800/50 shrink-0 z-30 relative" style={{ backgroundColor: 'rgb(30 41 59)' }}>
      <div className="flex items-center gap-3 min-w-0">
        {showMenuButton && onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors shrink-0"
            title="Open menu"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
      </div>
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <form method="get" action="/search" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            name="q"
            placeholder="Search articles…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm tracking-tight"
            aria-label="Search"
          />
        </form>
      </div>
      <div className="shrink-0">
        <UserMenu email={email} fullName={fullName} role={role} />
      </div>
    </header>
  )
}
