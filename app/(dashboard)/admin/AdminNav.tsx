'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FolderOpen, FileText, GraduationCap, Award } from 'lucide-react'
import type { UserRole } from '@/lib/types'

const ALL_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/admin/users', label: 'Team Members', icon: Users, adminOnly: true },
  { href: '/admin/sections', label: 'Sections', icon: FolderOpen, adminOnly: true },
  { href: '/admin/articles', label: 'Articles', icon: FileText, adminOnly: false },
  { href: '/admin/training', label: 'Training', icon: GraduationCap, adminOnly: true },
  { href: '/admin/certification', label: 'Certification', icon: Award, adminOnly: true },
] as const

export function AdminNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const isAdmin = role === 'admin'
  const nav = ALL_NAV.filter((item) => isAdmin || !item.adminOnly)

  return (
    <nav className="flex flex-wrap gap-2 mb-8 border-b border-slate-800/50 pb-4">
      {nav.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
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
  )
}
