'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export interface UpdateItem {
  id: string
  title: string
  slug: string
  sectionSlug: string
  sectionTitle: string
  updatedAt: string
}

interface UpdatesSidebarProps {
  items: UpdateItem[]
  viewAllHref?: string
  /** Max number of items to show before scrolling (default 6) */
  maxVisible?: number
}

export function UpdatesSidebar({ items, viewAllHref = '/search', maxVisible = 6 }: UpdatesSidebarProps) {
  return (
    <aside className="w-full lg:w-[260px] lg:min-w-[260px] lg:shrink-0 lg:self-start lg:sticky lg:top-6">
      <div className="rounded-xl border border-slate-800/50 bg-slate-800/30 overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-800/50">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Recently updated
          </h2>
        </div>
        <ul className="overflow-y-auto p-2 space-y-0.5 max-h-[320px] min-h-[80px]">
          {items.length === 0 ? (
            <li className="px-2.5 py-4 text-xs text-slate-500 text-center">
              No updates yet.
            </li>
          ) : (
            items.slice(0, maxVisible * 2).map((item) => {
              const date = new Date(item.updatedAt)
              const isRecent = Date.now() - date.getTime() < 24 * 60 * 60 * 1000
              const dateStr = isRecent
                ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
                : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              return (
                <li key={item.id}>
                  <Link
                    href={`/section/${item.sectionSlug}/${item.slug}`}
                    className="group flex items-start gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-700/40 transition-colors"
                  >
                    <span className="text-[13px] text-white font-medium line-clamp-2 group-hover:text-slate-100 flex-1 min-w-0">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 shrink-0 tabular-nums">
                      {dateStr}
                    </span>
                  </Link>
                </li>
              )
            })
          )}
        </ul>
        {items.length > 0 && viewAllHref && (
          <div className="px-2.5 py-2 border-t border-slate-800/50">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              View all
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
