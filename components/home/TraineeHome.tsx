'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, FileText, LayoutGrid } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from './ProgressRing'
import { ModuleJourney, type ModuleStep } from './ModuleJourney'
import { QuickAccessCard } from './QuickAccessCard'

export interface InProgressQuiz {
  moduleId: string
  moduleSlug: string
  moduleTitle: string
  currentIndex: number
  totalQuestions: number
}

export interface TraineeHomeProps {
  fullName: string
  greeting: string
  completedCount: number
  totalModules: number
  nextModule: { slug: string; title: string; description: string | null; hasProgress?: boolean } | null
  moduleSteps: ModuleStep[]
  hoursCompleted: number
  hoursRemaining: number
  avgQuizScore: number | null
  quickAccess: Array<{ title: string; href: string; description?: string }>
  inProgressQuizzes?: InProgressQuiz[]
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
  inProgressQuizzes = [],
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

      {/* Continue Where You Left Off (in-progress quizzes) */}
      {inProgressQuizzes.length > 0 && (
        <section className="rounded-xl border border-slate-800/50 bg-slate-800/40 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span aria-hidden>📚</span>
            Continue Where You Left Off
          </h2>
          <div className="space-y-4">
            {inProgressQuizzes.map((q) => (
              <div
                key={q.moduleId}
                className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{q.moduleTitle}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Question {q.currentIndex + 1} of {q.totalQuestions}
                  </p>
                  <div className="mt-2 max-w-xs">
                    <ProgressBar
                      value={q.totalQuestions ? (q.currentIndex / q.totalQuestions) * 100 : 0}
                      showLabel={false}
                      compact
                      valueLabel={`${q.currentIndex + 1}/${q.totalQuestions}`}
                    />
                  </div>
                </div>
                <Link
                  href={`/training/${q.moduleSlug}/quiz?resume=1`}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#d35400] text-white font-medium text-sm transition-colors shrink-0"
                >
                  Resume Quiz
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

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
        <div className="mt-6">
          <ProgressBar
            value={totalModules ? (completedCount / totalModules) * 100 : 0}
            label="Overall progress"
            valueLabel={`${completedCount} of ${totalModules} modules`}
            variant="indigo"
          />
        </div>
        {nextModule && (
          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <Link
              href={`/training/${nextModule.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-base transition-colors"
            >
              {nextModule.hasProgress ? `Resume — ${nextModule.title}` : `Start your training — ${nextModule.title}`}
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
