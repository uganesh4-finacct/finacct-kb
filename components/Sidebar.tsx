'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  GraduationCap,
  Lock,
  FileText,
  LayoutGrid,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import { FileXls, Table } from 'phosphor-react'
import type { UserRole } from '@/lib/types'
import type { Section } from '@/lib/types'
import { getDeduplicatedSections } from '@/lib/sections'

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  file: FileText,
  grid: LayoutGrid,
  default: BookOpen,
}

interface SidebarProps {
  role: UserRole
  sections: Section[]
  onCollapse?: () => void
  collapsed?: boolean
}

export function Sidebar({ role, sections, onCollapse, collapsed }: SidebarProps) {
  const pathname = usePathname()
  const isTrainee = role === 'trainee'
  const isAdmin = role === 'admin'

  const mainSections = isTrainee
    ? []
    : getDeduplicatedSections(sections)

  function navLink(href: string, label: string, icon: React.ReactNode, locked?: boolean) {
    const isActive =
      pathname === href ||
      (href !== '/home' && pathname?.startsWith(href + '/'))
    if (locked) {
      return (
        <span
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 cursor-not-allowed"
          title="Access restricted"
        >
          {icon}
          <span className="text-sm">{label}</span>
          <Lock className="w-4 h-4 ml-auto shrink-0 opacity-60" />
        </span>
      )
    }
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium tracking-tight transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    )
  }

  const IconHome = Home
  const IconTraining = GraduationCap
  const IconAdmin = Settings

  return (
    <div className="flex flex-col h-full w-full min-w-[240px]">
      <div className="p-3 border-b border-slate-800/50 shrink-0">
        <Link href="/home" className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800">
          <Image
            src="/FAacademy.png"
            alt="FinAcct360 Academy"
            width={36}
            height={36}
            className="rounded-lg shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-white text-sm leading-tight truncate">FinAcct360</span>
            <span className="text-xs text-slate-400 leading-tight truncate">Academy</span>
          </div>
        </Link>
      </div>
      <nav className="p-3 space-y-1 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain py-4">
        {/* Home - always first */}
        {navLink('/home', 'Home', <IconHome className="w-5 h-5 shrink-0" />)}

        {isTrainee ? (
          <>
            <p className="px-3 py-1.5 mt-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Training
            </p>
            {navLink(
              `/training`,
              'Training',
              <IconTraining className="w-5 h-5 shrink-0" />
            )}
          </>
        ) : (
          <>
            <p className="px-3 py-1.5 mt-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Sections
            </p>
            {mainSections.map((section) => {
              const Icon = SECTION_ICONS[section.icon] ?? SECTION_ICONS.default
              return (
                <div key={section.id}>
                  {navLink(
                    `/section/${section.slug}`,
                    section.title,
                    <Icon className="w-5 h-5 shrink-0" />
                  )}
                </div>
              )
            })}
            <p className="px-3 py-1.5 mt-4 text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <FileXls className="w-3.5 h-3.5 shrink-0" size={14} />
              Templates
            </p>
            {navLink(
              '/templates/coa',
              'COA Templates',
              <Table className="w-5 h-5 shrink-0" size={20} />
            )}
            <p className="px-3 py-1.5 mt-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Training
            </p>
            {navLink(
              '/training',
              'Training',
              <IconTraining className="w-5 h-5 shrink-0" />
            )}
            {isAdmin && (
              <>
                <p className="px-3 py-1.5 mt-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Admin
                </p>
                {navLink(
                  '/admin',
                  'Admin',
                  <IconAdmin className="w-5 h-5 shrink-0" />
                )}
              </>
            )}
          </>
        )}
      </nav>
      {onCollapse && (
        <div className="p-3 border-t border-slate-800/50 shrink-0">
          <button
            type="button"
            onClick={onCollapse}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
            <span>Collapse</span>
          </button>
        </div>
      )}
    </div>
  )
}
