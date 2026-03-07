'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ModuleNavigationProps {
  previousModule?: {
    slug: string
    title: string
  }
  nextModule?: {
    slug: string
    title: string
  }
  quizSlug?: string
  canTakeQuiz?: boolean
  questionCount?: number
  passScore?: number
}

export function ModuleNavigation({
  previousModule,
  nextModule,
  quizSlug,
  canTakeQuiz = true,
  questionCount = 0,
  passScore = 80,
}: ModuleNavigationProps) {
  return (
    <div className="mt-8 pt-6 border-t border-slate-800/50 overflow-hidden">
      <div className="flex flex-wrap items-stretch justify-between gap-4">
        {previousModule ? (
          <Link
            href={`/training/${previousModule.slug}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80 transition-colors group min-w-0 flex-1 max-w-[280px]"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Previous Module</div>
              <div className="text-sm font-medium text-white mt-0.5 truncate">{previousModule.title}</div>
            </div>
          </Link>
        ) : (
          <div className="min-w-0 flex-1 max-w-[280px]" />
        )}

        {quizSlug && (
          <Link
            href={`/training/${quizSlug}/quiz`}
            className={`flex flex-col justify-center gap-0.5 px-5 py-3 rounded-xl font-semibold transition-all min-w-0 flex-1 max-w-[280px] ${
              canTakeQuiz
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/30 border border-slate-800/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-2">
              Take Quiz
              <ArrowRight className="w-4 h-4 shrink-0" />
            </span>
            {questionCount > 0 && (
              <span className="text-xs font-normal opacity-90 mt-0.5">
                {questionCount} questions • {passScore}% to pass
              </span>
            )}
          </Link>
        )}

        {nextModule && !quizSlug && (
          <Link
            href={`/training/${nextModule.slug}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80 transition-colors group min-w-0 flex-1 max-w-[280px]"
          >
            <div className="min-w-0 flex-1 text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Next Module</div>
              <div className="text-sm font-medium text-white mt-0.5 truncate">{nextModule.title}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
          </Link>
        )}
      </div>
    </div>
  )
}
