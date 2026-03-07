'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { recordModuleProgress } from '@/lib/training-actions'

const QUIZ_UNLOCK_AFTER_MS = 2 * 60 * 1000 // 2 minutes

export function TrainingModuleContent({
  moduleId,
  moduleSlug,
  estimatedMinutes,
}: {
  moduleId: string
  moduleSlug: string
  estimatedMinutes: number
}) {
  const startRef = useRef<number>(Date.now())
  const [quizEnabled, setQuizEnabled] = useState(false)
  const contentEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = startRef.current
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      if (elapsed >= QUIZ_UNLOCK_AFTER_MS) setQuizEnabled(true)
      if (elapsed > 0 && Math.floor(elapsed / 1000) % 30 === 0 && Math.floor(elapsed / 1000) > 0) {
        recordModuleProgress(moduleId, 30)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [moduleId])

  useEffect(() => {
    const el = contentEndRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setQuizEnabled(true)
      },
      { threshold: 0.5, rootMargin: '0px 0px -100px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000)
      if (elapsed > 0) recordModuleProgress(moduleId, elapsed)
    }
  }, [moduleId])

  return (
    <>
      <div ref={contentEndRef} className="h-1" aria-hidden />
      <div className="flex flex-col items-center gap-3 pt-8">
        {!quizEnabled && (
          <p className="text-slate-500 text-sm">Scroll to the end or wait 2 minutes to unlock the quiz.</p>
        )}
        <Link
          href={quizEnabled ? `/training/${moduleSlug}/quiz` : '#'}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${
            quizEnabled
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed pointer-events-none'
          }`}
          aria-disabled={!quizEnabled}
        >
          Take Quiz
        </Link>
      </div>
    </>
  )
}
