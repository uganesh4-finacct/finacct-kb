'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, FileText, LayoutGrid } from 'lucide-react'
import { ProgressRing } from './ProgressRing'
import { ModuleJourney, type ModuleStep } from './ModuleJourney'
import { QuickAccessCard } from './QuickAccessCard'

export interface TraineeHomeProps {
  fullName: string
  greeting: string
  completedCount: number
  totalModules: number
  nextModule: { slug: string; title: string; description: string | null } | null
  moduleSteps: ModuleStep[]
  hoursCompleted: number
  hoursRemaining: number
  avgQuizScore: number | null
  quickAccess: Array<{ title: string; href: string; description?: string }>
}

const QUICK_ICONS = [BookOpen, FileText, LayoutGrid] as const

export function TraineeHome({
  fullName,
  greeting,
  completedCount,
  totalModules,
  nextModule,
  moduleSteps,
  hoursCompleted,
  hoursRemaining,
  avgQuizScore,
  quickAccess,
}: TraineeHomeProps) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-white">
          {greeting}, {fullName}
        </h1>
        <p className="text-slate-400 mt-1 text-base font-normal">
          Continue your training to get certified.
        </p>
      </header>

      {/* Hero: Progress ring + stats + CTA */}
      <section className="rounded-xl border border-slate-800/50 bg-slate-800/40 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <ProgressRing completed={completedCount} total={totalModules} />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-800/50 bg-slate-800/60 p-4">
              <p className="text-sm uppercase tracking-wide text-slate-500">Hours completed</p>
              <p className="text-xl font-semibold text-white mt-1">{hoursCompleted}h</p>
            </div>
            <div className="rounded-lg border border-slate-800/50 bg-slate-800/60 p-4">
              <p className="text-sm uppercase tracking-wide text-slate-500">Hours remaining</p>
              <p className="text-xl font-semibold text-white mt-1">{hoursRemaining}h</p>
            </div>
            <div className="rounded-lg border border-slate-800/50 bg-slate-800/60 p-4">
              <p className="text-sm uppercase tracking-wide text-slate-500">Avg quiz score</p>
              <p className="text-xl font-semibold text-white mt-1">
                {avgQuizScore != null ? `${Math.round(avgQuizScore)}%` : '—'}
              </p>
            </div>
          </div>
        </div>
        {nextModule && (
          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <Link
              href={`/training/${nextModule.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-base transition-colors"
            >
              Continue — {nextModule.title}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {nextModule.description && (
              <p className="text-sm text-slate-400 mt-2 max-w-xl">{nextModule.description}</p>
            )}
          </div>
        )}
      </section>

      {/* Module journey */}
      <ModuleJourney modules={moduleSteps} totalModules={totalModules} />

      {/* Quick access */}
      {quickAccess.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
            Quick access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccess.slice(0, 4).map((item, i) => (
              <QuickAccessCard
                key={item.href + item.title}
                title={item.title}
                href={item.href}
                description={item.description}
                icon={QUICK_ICONS[i % QUICK_ICONS.length]}
                iconClassName="text-green-500"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
