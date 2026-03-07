'use client'

import Link from 'next/link'
import { Check, Circle, Lock } from 'lucide-react'

export interface JourneyModule {
  id: string
  title: string
  slug: string
  orderIndex: number
  completed: boolean
  locked: boolean
}

interface JourneyProgressProps {
  modules: JourneyModule[]
  currentModuleId: string
  className?: string
}

export function JourneyProgress({
  modules,
  currentModuleId,
  className = '',
}: JourneyProgressProps) {
  return (
    <div
      className={`bg-slate-800/30 rounded-xl p-4 overflow-hidden ${className}`.trim()}
    >
      <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">
        Your Journey
      </h3>
      <div className="space-y-1 max-h-[280px] overflow-y-auto">
        {modules.map((module, index) => {
          const isCurrent = module.id === currentModuleId
          const content = (
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                isCurrent
                  ? 'bg-green-500/20 text-green-400'
                  : module.completed
                  ? 'text-slate-400'
                  : module.locked
                  ? 'text-slate-600'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {module.completed ? (
                <Check size={16} className="text-green-500 shrink-0" />
              ) : isCurrent ? (
                <Circle size={16} className="text-green-400 fill-green-400 shrink-0" />
              ) : module.locked ? (
                <Lock size={16} className="text-slate-600 shrink-0" />
              ) : (
                <Circle size={16} className="text-slate-500 shrink-0" />
              )}
              <span className="truncate">
                {index + 1}. {module.title}
              </span>
            </div>
          )
          if (module.locked) {
            return <div key={module.id}>{content}</div>
          }
          return (
            <Link
              key={module.id}
              href={`/training/${module.slug}`}
              className="block"
            >
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
