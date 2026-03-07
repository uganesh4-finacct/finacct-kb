'use client'

import Link from 'next/link'
import { Copy, Check } from 'lucide-react'

export interface HeadingItem {
  id: string
  text: string
  level: number
}

export interface RelatedArticle {
  id: string
  title: string
  slug: string
}

const COA_QUICK_COPY = [
  { id: '4100', label: 'Food Sales' },
  { id: '4200', label: 'Beverage Sales' },
  { id: '4300', label: 'Third-Party Delivery' },
  { id: '4400', label: 'Other Revenue' },
  { id: '5100', label: 'Food Cost' },
  { id: '5200', label: 'Beverage Cost' },
  { id: '5300', label: 'Packaging' },
  { id: '6100', label: 'FOH Wages' },
  { id: '6200', label: 'BOH Wages' },
  { id: '7100', label: 'Rent' },
]

interface ArticleSidebarProps {
  sectionSlug: string
  headings: HeadingItem[]
  related: RelatedArticle[]
  showQuickCopy?: boolean
  activeId: string | null
  quickCopySelected: Set<string>
  copied: boolean
  onToggleQuickCopy: (id: string) => void
  onCopyQuickCopy: () => void
}

/** Sidebar with IN THIS ARTICLE, QUICK COPY, RELATED. Each section in its own container with margin and scrollable to prevent overlap. */
export function ArticleSidebar({
  sectionSlug,
  headings,
  related,
  showQuickCopy = false,
  activeId,
  quickCopySelected,
  copied,
  onToggleQuickCopy,
  onCopyQuickCopy,
}: ArticleSidebarProps) {
  return (
    <aside
      className="hidden xl:flex xl:flex-col xl:w-64 xl:shrink-0 xl:sticky xl:top-24 xl:self-start xl:gap-6 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"
      style={{ zIndex: 10 }}
      aria-label="Article navigation and related"
    >
      {/* IN THIS ARTICLE - own container, margin, scrollable */}
      <nav
        className="flex-shrink-0 rounded-xl border border-slate-800/50 bg-slate-800/95 p-4 overflow-hidden"
        aria-label="In this article"
      >
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
          IN THIS ARTICLE
        </p>
        <ul className="space-y-1 text-sm max-h-48 overflow-y-auto overflow-x-hidden">
          {headings.map((h) => (
            <li
              key={h.id}
              style={{ paddingLeft: (h.level - 1) * 12 }}
              className="truncate"
            >
              <a
                href={`#${h.id}`}
                className={`block py-1.5 rounded px-2 -mx-2 transition-colors ${
                  activeId === h.id
                    ? 'text-indigo-400 font-medium bg-indigo-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
        {headings.length === 0 && <p className="text-slate-500 text-xs">No headings</p>}
      </nav>

      {/* QUICK COPY - own container */}
      {showQuickCopy && (
        <div className="flex-shrink-0 rounded-xl border border-slate-800/50 bg-slate-800/95 p-4 flex flex-col overflow-hidden mt-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            QUICK COPY
          </p>
          <div className="max-h-52 overflow-y-auto overflow-x-hidden flex-shrink-0 -mx-1 px-1">
            {COA_QUICK_COPY.map((row) => (
              <label
                key={row.id}
                className="flex items-center gap-2 py-2 text-sm text-slate-300 cursor-pointer hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={quickCopySelected.has(row.id)}
                  onChange={() => onToggleQuickCopy(row.id)}
                  className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 shrink-0"
                />
                <span className="truncate min-w-0">
                  {row.id} {row.label}
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={onCopyQuickCopy}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy selected'}
          </button>
        </div>
      )}

      {/* RELATED - own container */}
      {related.length > 0 && (
        <div className="flex-shrink-0 rounded-xl border border-slate-800/50 bg-slate-800/95 p-4 overflow-hidden mt-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            RELATED
          </p>
          <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
            {related.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/section/${sectionSlug}/${a.slug}`}
                  className="text-slate-400 hover:text-white line-clamp-2 block transition-colors"
                >
                  → {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
