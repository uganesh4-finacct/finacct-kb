'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SCROLL_OFFSET = 100

interface SectionNavProps {
  previousSectionId: string | null
  nextSectionId: string | null
  onMarkCompleteAndNext?: () => void
  onScrollToSection?: (id: string) => void
  isLastSection?: boolean
  quizSlug?: string
  canTakeQuiz?: boolean
  questionCount?: number
  passScore?: number
  previousModule?: { slug: string; title: string }
}

export function SectionNav({
  previousSectionId,
  nextSectionId,
  onMarkCompleteAndNext,
  onScrollToSection,
  isLastSection,
  quizSlug,
  canTakeQuiz = true,
  questionCount = 0,
  passScore = 80,
  previousModule,
}: SectionNavProps) {
  const scrollTo = (id: string) => {
    if (onScrollToSection) {
      onScrollToSection(id)
      return
    }
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <nav
      className="mt-8 pt-6 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4"
      aria-label="Section navigation"
    >
      <div className="flex items-center gap-3">
        {previousSectionId ? (
          <button
            type="button"
            onClick={() => scrollTo(previousSectionId)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        ) : previousModule ? (
          <Link
            href={`/training/${previousModule.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {previousModule.title}
          </Link>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {nextSectionId ? (
          <button
            type="button"
            onClick={onMarkCompleteAndNext ?? (() => scrollTo(nextSectionId))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Mark complete & Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </nav>
  )
}
