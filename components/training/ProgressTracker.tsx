'use client'

import { useEffect, useState } from 'react'
import { Check, Circle } from 'lucide-react'

export interface SectionItem {
  id: string
  text: string
  level: number
}

interface ProgressTrackerProps {
  contentRef: React.RefObject<HTMLDivElement>
  completedIds: Set<string>
  currentId: string | null
  onJump: (id: string) => void
  stickyTop?: string
  className?: string
}

export function ProgressTracker({
  contentRef,
  completedIds,
  currentId,
  onJump,
  stickyTop = 'top-24',
  className = '',
}: ProgressTrackerProps) {
  const [sections, setSections] = useState<SectionItem[]>([])

  useEffect(() => {
    if (!contentRef.current) return
    const elements = contentRef.current.querySelectorAll('h2, h3')
    const items: SectionItem[] = Array.from(elements).map((el, i) => {
      const id = `heading-${i}`
      ;(el as HTMLElement).id = id
      ;(el as HTMLElement).setAttribute('data-section', id)
      return {
        id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      }
    })
    setSections(items)
  }, [contentRef])

  const progressPct =
    sections.length > 0
      ? Math.round(
          (sections.filter((s) => completedIds.has(s.id)).length / sections.length) * 100
        )
      : 0

  if (sections.length === 0) return null

  return (
    <aside
      className={`w-72 flex-shrink-0 hidden lg:block self-start sticky ${stickyTop} z-40 ${className}`.trim()}
    >
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/95 p-4 overflow-hidden max-h-[calc(100vh-7rem)] overflow-y-auto">
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Progress
        </h3>
        <div className="text-2xl font-bold text-white mb-1 tabular-nums">
          {progressPct}%
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <nav className="space-y-0.5" aria-label="Module sections">
          {sections.map((s) => {
            const isActive = currentId === s.id
            const isComplete = completedIds.has(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onJump(s.id)}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  s.level === 3 ? 'pl-4' : 'pl-2'
                } ${
                  isActive
                    ? 'bg-green-500/20 text-green-400 font-medium'
                    : isComplete
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {isComplete ? (
                  <Check size={16} className="text-green-500 shrink-0" />
                ) : isActive ? (
                  <Circle size={16} className="text-green-400 fill-green-400 shrink-0" />
                ) : (
                  <Circle size={16} className="text-slate-600 shrink-0" />
                )}
                <span className="truncate">{s.text}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
