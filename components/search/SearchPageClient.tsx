'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { SuggestedKeywords } from './SuggestedKeywords'
import { CategoryBrowser, type CategorySection } from './CategoryBrowser'
import { RecentSearches } from './RecentSearches'
import { useRecentSearches } from '@/lib/hooks/useRecentSearches'

export interface SearchResultItem {
  type: 'article' | 'module'
  id: string
  href: string
  title: string
  subtitle: string
  highlightedTitle: string
  highlightedDescription: string | null
}

interface SearchPageClientProps {
  initialQuery: string
  results: SearchResultItem[]
  sections: CategorySection[]
}

export function SearchPageClient({
  initialQuery,
  results,
  sections,
}: SearchPageClientProps) {
  const router = useRouter()
  const { recentSearches, saveRecentSearch } = useRecentSearches()
  const hasQuery = initialQuery.length >= 2

  function handleSearch(q: string) {
    const trimmed = q.trim().slice(0, 200)
    if (!trimmed) return
    saveRecentSearch(trimmed)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[name="q"]')
    const value = input?.value?.trim() ?? ''
    handleSearch(value)
  }

  function clearSearch() {
    router.push('/search')
  }

  return (
    <div className="w-full">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          key={initialQuery || 'empty'}
          placeholder="Search articles, guides, SOPs..."
          className="w-full pl-12 pr-10 py-3 bg-slate-800 border border-slate-800/50 rounded-xl text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
          autoComplete="off"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {hasQuery ? (
        /* After search: results */
        <>
          <p className="mt-4 text-sm text-slate-400">
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{initialQuery}&quot;
          </p>
          <div className="mt-4 space-y-3">
            {results.length === 0 ? (
              <p className="text-slate-500 py-6">No results found.</p>
            ) : (
              results.map((r) => (
                <Link
                  key={r.id}
                  href={r.href}
                  className="block rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 hover:border-green-500/50 hover:bg-slate-800 transition"
                >
                  <span
                    className="font-medium text-white"
                    dangerouslySetInnerHTML={{ __html: r.highlightedTitle }}
                  />
                  <p className="text-sm text-slate-400 mt-1">{r.subtitle}</p>
                  {r.highlightedDescription && (
                    <p
                      className="text-slate-500 text-sm mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: r.highlightedDescription }}
                    />
                  )}
                </Link>
              ))
            )}
          </div>
        </>
      ) : (
        /* Before search: suggested, browse, recent */
        <>
          <SuggestedKeywords onSearch={handleSearch} />
          <CategoryBrowser sections={sections} />
          <RecentSearches items={recentSearches} onSearch={handleSearch} />
        </>
      )}
    </div>
  )
}
