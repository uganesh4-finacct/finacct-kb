'use client'

import Link from 'next/link'
import { Clock, FileText, Target, ArrowLeft, ArrowRight } from 'lucide-react'
import { StatBadge } from './StatBadge'
import { ProgressBar } from './ProgressBar'

interface ModuleHeaderProps {
  moduleNumber: number
  totalModules: number
  title: string
  description: string
  estimatedMinutes: number
  questionCount: number
  passScore?: number
  progress?: number
  showTakeQuiz?: boolean
  quizHref?: string
}

export function ModuleHeader({
  moduleNumber,
  totalModules,
  title,
  description,
  estimatedMinutes,
  questionCount,
  passScore = 80,
  progress = 0,
  showTakeQuiz = false,
  quizHref,
}: ModuleHeaderProps) {
  return (
    <header className="mb-8">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link
          href="/training"
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Training
        </Link>
        <span className="text-slate-600">•</span>
        <span className="text-green-400 font-medium">Module {moduleNumber} of {totalModules}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
        {title}
      </h1>

      <p className="text-lg text-slate-400 max-w-2xl mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <StatBadge icon={Clock} value={`${estimatedMinutes} min`} label="Est. time" />
        <StatBadge icon={FileText} value={`${questionCount} Q's`} label="Quiz" />
        <StatBadge icon={Target} value={`${passScore}%`} label="To pass" />

        <div className="flex-1" />

        {showTakeQuiz && quizHref && (
          <Link
            href={quizHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-all"
          >
            Take Quiz
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <ProgressBar value={progress} />
    </header>
  )
}
