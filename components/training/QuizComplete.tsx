'use client'

import Link from 'next/link'
import { ArrowRight, Check, BookOpen } from 'lucide-react'
import { Confetti } from '@/components/Confetti'

interface QuizCompletePassProps {
  correctCount: number
  totalQuestions: number
  scorePct: number
  moduleNumber: number
  totalModules: number
  nextModuleSlug: string | null
  nextModuleTitle?: string | null
  moduleSlug: string
  timeSpentFormatted?: string
  /** True when trainee just passed all modules and was upgraded to accountant */
  trainingJustCompleted?: boolean
}

export function QuizCompletePass({
  correctCount,
  totalQuestions,
  scorePct,
  moduleNumber,
  totalModules,
  nextModuleSlug,
  nextModuleTitle,
  moduleSlug,
  timeSpentFormatted,
  trainingJustCompleted,
}: QuizCompletePassProps) {
  return (
    <div className="rounded-2xl border border-slate-800/50 bg-slate-800/30 p-8 relative overflow-hidden w-full max-w-xl mx-auto page-content">
      <Confetti />
      {trainingJustCompleted && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/40">
          <p className="text-lg font-semibold text-green-300">
            🎉 Training Complete! You now have full access to the FinAcct360 Academy as an Accountant.
          </p>
        </div>
      )}
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Module Complete!</h2>
        <p className="text-slate-400 mb-6">
          You scored {correctCount}/{totalQuestions} ({Math.round(scorePct)}%)
        </p>
        {timeSpentFormatted && (
          <p className="text-sm text-slate-500 mb-6">Time: {timeSpentFormatted}</p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/training/${moduleSlug}/quiz`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
          >
            Review Answers
          </Link>
          {nextModuleSlug ? (
            <Link
              href={`/training/${nextModuleSlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
            >
              Next: {nextModuleTitle ?? `Module ${moduleNumber + 1}`} →
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/training"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
            >
              Back to Training
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

interface QuizCompleteFailProps {
  correctCount: number
  totalQuestions: number
  scorePct: number
  moduleSlug: string
}

export function QuizCompleteFail({
  correctCount,
  totalQuestions,
  scorePct,
  moduleSlug,
}: QuizCompleteFailProps) {
  return (
    <div className="rounded-2xl border border-slate-800/50 bg-slate-800/30 p-8 w-full max-w-xl mx-auto page-content">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen size={40} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Almost There!</h2>
        <p className="text-slate-400 mb-2">
          You scored {correctCount}/{totalQuestions} ({Math.round(scorePct)}%)
        </p>
        <p className="text-slate-500 mb-6">Need 80% to pass</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/training/${moduleSlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
          >
            Review Module
          </Link>
          <Link
            href={`/training/${moduleSlug}/quiz`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
          >
            Retake Quiz
          </Link>
        </div>
      </div>
    </div>
  )
}
