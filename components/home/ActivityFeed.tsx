'use client'

import Link from 'next/link'

export interface ActivityItem {
  id: string
  type: 'article_edit' | 'quiz_complete' | 'user_joined'
  title: string
  meta: string
  href?: string
  at: string
}

interface ActivityFeedProps {
  items: ActivityItem[]
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

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <ul className="space-y-2">
      {items.length === 0 ? (
        <li className="text-sm text-slate-500 py-4">No recent activity.</li>
      ) : (
        items.map((item) => {
          const content = (
            <>
              <span className="text-base font-medium text-white">{item.title}</span>
              <span className="text-sm text-slate-500 ml-1">{item.meta}</span>
              <span className="text-slate-600 text-xs ml-2">{formatTimeAgo(item.at)}</span>
            </>
          )
          return (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="block py-2 px-3 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  {content}
                </Link>
              ) : (
                <div className="py-2 px-3 rounded-lg">{content}</div>
              )}
            </li>
          )
        })
      )}
    </ul>
  )
}
