'use client'

import { ReactNode } from 'react'

export type CategoryKind =
  | 'reference'
  | 'guide'
  | 'checklist'
  | 'template'
  | 'troubleshoot'
  | 'faq'

const CATEGORY_COLORS: Record<CategoryKind, string> = {
  reference: 'bg-blue-400',
  guide: 'bg-green-400',
  checklist: 'bg-yellow-400',
  template: 'bg-purple-400',
  troubleshoot: 'bg-red-400',
  faq: 'bg-cyan-400',
}

export interface CategorySectionProps {
  categoryName: string
  categoryKind: CategoryKind
  count: number
  children: ReactNode
}

export function CategorySection({
  categoryName,
  categoryKind,
  count,
  children,
}: CategorySectionProps) {
  const categoryColor = CATEGORY_COLORS[categoryKind] ?? 'bg-slate-400'
  return (
    <>
      <div className="flex items-center gap-4 mb-6 mt-8 first:mt-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${categoryColor}`} />
          <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {categoryName}
          </h2>
        </div>
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-500">{count} articles</span>
      </div>
      {children}
    </>
  )
}
