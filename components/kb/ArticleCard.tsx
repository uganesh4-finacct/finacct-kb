'use client'

import Link from 'next/link'
import { Bookmark } from 'lucide-react'

export type ArticleType = 'reference' | 'guide' | 'checklist' | 'template' | 'troubleshoot'

const TYPE_STYLES: Record<ArticleType, string> = {
  reference: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  guide: 'bg-green-500/10 text-green-400 border border-green-500/20',
  checklist: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  template: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  troubleshoot: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

export interface ArticleCardProps {
  type: ArticleType
  title: string
  description: string | null
  readTime?: number
  saves?: number
  href: string
  isPinned?: boolean
  onBookmarkClick?: (e: React.MouseEvent) => void
}

export function ArticleCard({
  type,
  title,
  description,
  href,
  isPinned = false,
  onBookmarkClick,
}: ArticleCardProps) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl bg-slate-800/30 border border-slate-800/50 p-4 hover:bg-slate-800/50 hover:border-slate-600 transition-all cursor-pointer block"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wide ${TYPE_STYLES[type]}`}
        >
          {type === 'reference' && 'Reference'}
          {type === 'guide' && 'Guide'}
          {type === 'checklist' && 'Checklist'}
          {type === 'template' && 'Template'}
          {type === 'troubleshoot' && 'Troubleshoot'}
        </span>
        {onBookmarkClick && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBookmarkClick(e)
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-700"
            title={isPinned ? 'Unpin' : 'Pin to Quick Access'}
            aria-label={isPinned ? 'Unpin' : 'Pin'}
          >
            <Bookmark
              className={`w-4 h-4 ${isPinned ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}
            />
          </button>
        )}
      </div>

      <h3 className="text-base font-medium text-white mb-2 group-hover:text-green-400 transition-colors">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
      )}
    </Link>
  )
}
