'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, FileText, LayoutGrid, GraduationCap } from 'lucide-react'
import type { Section } from '@/lib/types'

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  file: FileText,
  grid: LayoutGrid,
  default: BookOpen,
}

interface SectionTabsProps {
  sections: Section[]
}

export function SectionTabs({ sections }: SectionTabsProps) {
  const pathname = usePathname()
  const mainSections = sections
    .filter((s) => s.is_published && !s.is_training_section)
    .sort((a, b) => a.order_index - b.order_index)

  const trainingSection = sections.find((s) => s.is_training_section)

  return (
    <div className="sticky top-0 z-20 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 no-print" data-section-tabs>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-thin" aria-label="Section tabs">
          {mainSections.map((section) => {
            const href = `/section/${section.slug}`
            const isActive =
              pathname === href || (pathname.startsWith(href + '/') && pathname.length > href.length + 1)
            const Icon = SECTION_ICONS[section.icon] ?? SECTION_ICONS.default
            return (
              <Link
                key={section.id}
                href={href}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium tracking-tight whitespace-nowrap transition-colors
                  ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {section.title}
              </Link>
            )
          })}
          {trainingSection && (
            <Link
              href="/training"
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${pathname.startsWith('/training') ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              Training
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
