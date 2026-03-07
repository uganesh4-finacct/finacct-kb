'use client'

import Link from 'next/link'
import { Pin, Plus } from 'lucide-react'

export interface PinnedArticle {
  id: string
  title: string
  url: string
}

export interface PinnedArticlesProps {
  articles: PinnedArticle[]
  sectionSlug: string
  onManagePins?: () => void
  pinArticleHref?: string
}

export function PinnedArticles({
  articles,
  onManagePins,
  pinArticleHref,
}: PinnedArticlesProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Pinned Articles
        </h2>
        {onManagePins && (
          <button
            type="button"
            onClick={onManagePins}
            className="text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            Manage pins
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={article.url}
            className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/10 to-slate-800/50 border border-green-500/20 hover:border-green-500/40 transition-all"
          >
            <Pin className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-sm font-medium text-white whitespace-nowrap">{article.title}</span>
          </Link>
        ))}

        {pinArticleHref ? (
          <Link
            href={pinArticleHref}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-800/50 hover:border-slate-600 text-slate-500 hover:text-slate-400 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Pin article</span>
          </Link>
        ) : (
          <button
            type="button"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-800/50 hover:border-slate-600 text-slate-500 hover:text-slate-400 transition-all"
            title="Pin articles from the cards below"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Pin article</span>
          </button>
        )}
      </div>
    </div>
  )
}
