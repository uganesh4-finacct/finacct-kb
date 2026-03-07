'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FolderOpen, FileText, GraduationCap } from 'lucide-react'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Team Members', icon: Users },
  { href: '/admin/sections', label: 'Sections', icon: FolderOpen },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/training', label: 'Training', icon: GraduationCap },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <nav className="flex flex-wrap gap-2 mb-8 border-b border-slate-800/50 pb-4">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      {children}
    </div>
  )
}
