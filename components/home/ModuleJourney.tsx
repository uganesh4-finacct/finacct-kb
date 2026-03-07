'use client'

import Link from 'next/link'
import { Check, Circle, Lock } from 'lucide-react'

export interface ModuleStep {
  id: string
  slug: string
  title: string
  orderIndex: number
  isCompleted: boolean
  isCurrent: boolean
  isLocked: boolean
}

interface ModuleJourneyProps {
  modules: ModuleStep[]
  totalModules: number
}

export function ModuleJourney({ modules, totalModules }: ModuleJourneyProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
        Module journey
      </h2>
      <div className="flex flex-wrap gap-2 lg:gap-1 lg:flex-nowrap lg:items-center lg:justify-start">
        {modules.map((mod, index) => {
          const isLast = index === modules.length - 1
          const href = mod.isLocked ? undefined : `/training/${mod.slug}`

          const content = (
            <>
              <span
                className={`
                  flex items-center justify-center w-9 h-9 rounded-full border-2 shrink-0 text-sm font-medium
                  ${mod.isCompleted ? 'bg-green-500/20 border-green-500 text-green-400' : ''}
                  ${mod.isCurrent ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400 animate-pulse' : ''}
                  ${mod.isLocked ? 'border-slate-600 bg-slate-800/30 text-slate-500' : ''}
                  ${!mod.isCompleted && !mod.isCurrent && !mod.isLocked ? 'border-slate-500 bg-slate-700/50 text-slate-300' : ''}
                `}
              >
                {mod.isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : mod.isLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5" fill="currentColor" />
                )}
              </span>
              <span className="sr-only lg:not-sr-only lg:absolute lg:bottom-full lg:left-1/2 lg:-translate-x-1/2 lg:mb-1 lg:px-2 lg:py-1 lg:rounded lg:bg-slate-800 lg:text-xs lg:text-white lg:whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity lg:pointer-events-none lg:max-w-[140px] lg:truncate">
                {mod.title}
              </span>
            </>
          )

          return (
            <span key={mod.id} className="flex items-center gap-0">
              {href ? (
                <Link
                  href={href}
                  className="group relative flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  title={mod.title}
                >
                  {content}
                </Link>
              ) : (
                <span className="group relative flex items-center justify-center cursor-not-allowed" title={mod.title}>
                  {content}
                </span>
              )}
              {!isLast && (
                <span
                  className={`
                    hidden lg:block w-6 h-0.5 mx-0.5 shrink-0
                    ${mod.isCompleted ? 'bg-green-500/50' : 'bg-slate-700'}
                  `}
                  aria-hidden
                />
              )}
            </span>
          )
        })}
      </div>
      <p className="text-xs text-slate-500">
        ✓ Complete &nbsp; ● Current &nbsp; ○ Locked
      </p>
    </section>
  )
}
