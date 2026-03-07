'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useSidebarState } from '@/lib/hooks/useSidebarState'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import type { UserRole } from '@/lib/types'
import type { Section } from '@/lib/types'

interface DashboardShellProps {
  children: React.ReactNode
  email: string
  fullName: string | null
  role: UserRole
  sections: Section[]
}

export function DashboardShell({ children, email, fullName, role, sections }: DashboardShellProps) {
  const { collapsed, toggle } = useSidebarState()
  const isOverlay = useMediaQuery('(max-width: 1023px)')

  const sidebarOpen = !collapsed
  const showSidebarInline = sidebarOpen && !isOverlay
  const showSidebarOverlay = sidebarOpen && isOverlay

  return (
    <div className="flex min-h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar - inline on desktop when expanded */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-slate-800/95 border-r border-slate-800/50
          transition-all duration-300 ease-in-out z-40 flex flex-col
          ${showSidebarInline ? 'w-[240px]' : 'w-0 -translate-x-full overflow-hidden'}
        `}
        aria-label="Main navigation"
      >
        <Sidebar
          role={role}
          sections={sections}
          onCollapse={toggle}
          collapsed={false}
        />
      </aside>

      {/* Mobile/tablet overlay sidebar */}
      {showSidebarOverlay && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={toggle}
            aria-hidden
          />
          <aside
            className="fixed top-0 left-0 w-72 h-screen bg-slate-800/95 border-r border-slate-800/50 z-50 flex flex-col shadow-xl"
            aria-label="Main navigation"
          >
            <Sidebar
              role={role}
              sections={sections}
              onCollapse={toggle}
              collapsed={false}
            />
          </aside>
        </>
      )}

      {/* Floating expand button when collapsed (desktop only; below header so it doesn't hide the top bar) */}
      {collapsed && !isOverlay && (
        <button
          type="button"
          onClick={toggle}
          className="fixed top-20 left-4 z-40 p-2 bg-slate-800 border border-slate-800/50 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white shadow-lg"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Main content */}
      <main
        className={`
          flex-1 min-h-screen flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${showSidebarInline ? 'ml-[240px]' : 'ml-0'}
        `}
        style={
          { '--dashboard-content-left': showSidebarInline ? '240px' : '0' } as React.CSSProperties
        }
      >
        <Header
          email={email}
          fullName={fullName}
          role={role}
          sidebarCollapsed={collapsed}
          onMenuClick={toggle}
          showMenuButton={isOverlay}
        />
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
