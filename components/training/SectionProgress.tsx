'use client'

import { Check, Circle } from 'lucide-react'

export interface SectionItem {
  id: string
  title: string
  level: number
}

interface SectionProgressProps {
  sections: SectionItem[]
  readSectionIds: Set<string>
  onJump: (id: string) => void
  className?: string
}

export function SectionProgress({
  sections,
  readSectionIds,
  onJump,
  className = '',
}: SectionProgressProps) {
  const totalSections = sections.length
  const sectionsRead = totalSections > 0
    ? sections.filter((s) => readSectionIds.has(s.id)).length
    : 0
  const progressPct = totalSections > 0 ? (sectionsRead / totalSections) * 100 : 0

  if (totalSections === 0) return null

  return (
    <div
      className={`bg-slate-800/30 rounded-xl p-4 overflow-hidden ${className}`.trim()}
    >
      <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">
        This Module
      </h3>
      <div className="text-2xl font-bold text-white mb-2 tabular-nums">
        {sectionsRead}/{totalSections}
      </div>
      <div className="h-2 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={sectionsRead}
          aria-valuemin={0}
          aria-valuemax={totalSections}
        />
      </div>
      <nav className="space-y-1 max-h-[240px] overflow-y-auto" aria-label="Module sections">
        {sections.map((s) => {
          const read = readSectionIds.has(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onJump(s.id)}
              className={`w-full flex items-center gap-2 text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                s.level === 3 ? 'pl-4' : ''
              } ${
                read
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {read ? (
                <Check size={14} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={14} className="text-slate-600 shrink-0" />
              )}
              <span className="truncate">{s.title}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
