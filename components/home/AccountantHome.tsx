'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, BookOpen, FileText, Clock } from 'lucide-react'
import { QuickAccessCard } from './QuickAccessCard'

export interface FrequentlyUsedItem {
  id: string
  title: string
  href: string
  readTime?: number
  visitCount?: number
}

export interface ContinueReadingItem {
  id: string
  title: string
  href: string
  readAt: string
  timeAgo: string
}

export interface SectionCardItem {
  id: string
  title: string
  slug: string
  articleCount: number
  icon: string
}

export interface AccountantHomeProps {
  fullName: string
  greeting: string
  frequentlyUsed: FrequentlyUsedItem[]
  continueReading: ContinueReadingItem[]
  sections: SectionCardItem[]
}

const SECTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  file: FileText,
  grid: BookOpen,
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

export function AccountantHome({
  fullName,
  greeting,
  frequentlyUsed,
  continueReading,
  sections,
}: AccountantHomeProps) {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-white">
          {greeting}, {fullName}
        </h1>
        <p className="text-slate-400 mt-1 text-base font-normal">
          Search and browse the knowledge base.
        </p>
      </header>

      {/* Search */}
      <section className="space-y-2">
        <label htmlFor="home-search" className="text-sm uppercase tracking-wide text-slate-500 font-medium">
          Search
        </label>
        <button
          type="button"
          id="home-search"
          onClick={() => router.push('/search')}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-800/50 bg-slate-800/30 hover:border-slate-600 text-left transition-colors"
        >
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <span className="text-slate-400 flex-1">Search articles, SOPs, guides…</span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-slate-700 text-slate-400 text-xs font-mono">
            ⌘K
          </kbd>
        </button>
      </section>

      {/* Frequently used */}
      {frequentlyUsed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
            Frequently used
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {frequentlyUsed.slice(0, 4).map((item) => (
              <QuickAccessCard
                key={item.id}
                title={item.title}
                href={item.href}
                meta={
                  item.readTime ? `${item.readTime} min read` : item.visitCount ? `${item.visitCount} visits` : undefined
                }
                icon={FileText}
              />
            ))}
          </div>
        </section>
      )}

      {/* Continue where you left off */}
      {continueReading.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
            Continue where you left off
          </h2>
          <ul className="space-y-2">
            {continueReading.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 hover:border-slate-600 transition-colors"
                >
                  <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-base font-medium text-white">{item.title}</span>
                    <span className="text-sm text-slate-500 ml-2">{item.timeAgo}</span>
                  </div>
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Browse by section */}
      {sections.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
            Browse by section
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((sec) => {
              const Icon = SECTION_ICON_MAP[sec.icon] ?? BookOpen
              return (
                <Link
                  key={sec.id}
                  href={`/section/${sec.slug}`}
                  className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 hover:border-slate-600 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-slate-700/50 text-slate-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-medium text-white">{sec.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{sec.articleCount} articles</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
