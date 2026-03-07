'use client'

import { Clock } from 'lucide-react'
import { formatSearchTimeAgo, type RecentSearchItem } from '@/lib/hooks/useRecentSearches'

interface RecentSearchesProps {
  items: RecentSearchItem[]
  onSearch: (query: string) => void
}

export function RecentSearches({ items, onSearch }: RecentSearchesProps) {
  if (items.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">Recent Searches</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={`${item.query}-${item.timestamp}-${index}`}
            type="button"
            onClick={() => onSearch(item.query)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white w-full text-left transition-colors"
          >
            <Clock size={14} className="shrink-0 text-slate-500" />
            <span className="truncate flex-1">{item.query}</span>
            <span className="text-slate-600 shrink-0">• {formatSearchTimeAgo(item.timestamp)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
