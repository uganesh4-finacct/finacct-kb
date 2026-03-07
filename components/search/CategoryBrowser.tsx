'use client'

import Link from 'next/link'

export interface CategorySection {
  id: string
  title: string
  slug: string
  articleCount: number
}

interface CategoryBrowserProps {
  sections: CategorySection[]
}

export function CategoryBrowser({ sections }: CategoryBrowserProps) {
  if (sections.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">Browse by Category</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/section/${section.slug}`}
            className="p-3 bg-slate-800/30 border border-slate-800/50 rounded-lg hover:border-slate-600 transition-colors block"
          >
            <span className="text-sm font-medium text-white">{section.title}</span>
            <span className="text-xs text-slate-500 block mt-0.5">
              {section.articleCount} article{section.articleCount !== 1 ? 's' : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
