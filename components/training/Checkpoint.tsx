'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, BookOpen } from 'lucide-react'
import { clearQuizProgress } from '@/lib/training-actions'

export const CHECKPOINT_STORAGE_KEY = 'finacct-module-checkpoints'

/** Clear checkpoint state for a module (e.g. when user clicks "Review" after failing quiz). */
export function clearCheckpointsForModule(moduleId: string): void {
  try {
    const raw = localStorage.getItem(CHECKPOINT_STORAGE_KEY)
    const stored = raw ? (JSON.parse(raw) as Record<string, number[]>) : {}
    delete stored[moduleId]
    localStorage.setItem(CHECKPOINT_STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // ignore
  }
}

const DEFAULT_CHECKPOINTS = [
  'I have read and understood the module content.',
  'I can explain the key concepts in my own words.',
  'I am ready to test my knowledge.',
  'I will complete the quiz without external help.',
]

interface CheckpointProps {
  /** Only show checkpoint box when all sections are read */
  allSectionsRead: boolean
  sectionsRead: number
  totalSections: number
  /** Checkpoint items (e.g. from "What you'll learn"); use first 4 or pad to 4 */
  checkpointItems: string[]
  moduleId: string
  moduleSlug: string
  questionCount: number
  passScore: number
  /** When true and user completes all checkpoints, call onFullReviewComplete (e.g. clear quiz lock) */
  fullReview?: boolean
  onFullReviewComplete?: () => void
  /** When set, show Resume Quiz (Question X/Y) and Start Over instead of Take Quiz */
  quizProgress?: { currentIndex: number; totalQuestions: number } | null
}

function getCheckpoints(items: string[]): string[] {
  const take = items.slice(0, 4)
  while (take.length < 4) {
    take.push(DEFAULT_CHECKPOINTS[take.length] ?? DEFAULT_CHECKPOINTS[0])
  }
  return take
}

export function Checkpoint({
  allSectionsRead,
  sectionsRead,
  totalSections,
  checkpointItems,
  moduleId,
  moduleSlug,
  questionCount,
  passScore,
  fullReview = false,
  onFullReviewComplete,
  quizProgress = null,
}: CheckpointProps) {
  const router = useRouter()
  const checkpoints = getCheckpoints(checkpointItems)
  const hasProgress = quizProgress != null && quizProgress.totalQuestions > 0

  const handleStartOver = async () => {
    await clearQuizProgress(moduleId)
    router.refresh()
  }
  const totalCheckpoints = checkpoints.length
  const fullReviewCalled = useRef(false)

  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(() => new Set())

  const allCheckpointsChecked = totalCheckpoints > 0 && checkedIndices.size >= totalCheckpoints
  useEffect(() => {
    if (fullReview && allCheckpointsChecked && onFullReviewComplete && !fullReviewCalled.current) {
      fullReviewCalled.current = true
      onFullReviewComplete()
    }
  }, [fullReview, allCheckpointsChecked, onFullReviewComplete])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKPOINT_STORAGE_KEY)
      const stored = raw ? (JSON.parse(raw) as Record<string, number[]>) : {}
      const arr = stored[moduleId] ?? []
      setCheckedIndices(new Set(arr))
    } catch {
      setCheckedIndices(new Set())
    }
  }, [moduleId])

  const toggleCheckpoint = (index: number) => {
    setCheckedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      try {
        const raw = localStorage.getItem(CHECKPOINT_STORAGE_KEY)
        const stored = raw ? (JSON.parse(raw) as Record<string, number[]>) : {}
        stored[moduleId] = Array.from(next)
        localStorage.setItem(CHECKPOINT_STORAGE_KEY, JSON.stringify(stored))
      } catch {}
      return next
    })
  }

  if (!allSectionsRead) {
    return (
      <div className="mt-12 p-6 bg-slate-800/30 rounded-xl text-center border border-slate-800/50">
        <BookOpen size={48} className="text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Keep reading</h3>
        <p className="text-slate-400 mb-4">
          Read all sections to unlock the checkpoint
        </p>
        <div className="text-sm text-slate-500">
          {sectionsRead} of {totalSections} sections read
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-800/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <span className="font-semibold text-white uppercase tracking-wide text-sm">
            Checkpoint
          </span>
        </div>
        <span className="text-sm text-slate-400 tabular-nums">
          {checkedIndices.size} / {totalCheckpoints}
        </span>
      </div>

      <p className="text-slate-400 mb-4">
        Before taking the quiz, confirm you understand:
      </p>

      <div className="space-y-3">
        {checkpoints.map((item, index) => (
          <label
            key={index}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={checkedIndices.has(index)}
              onChange={() => toggleCheckpoint(index)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500 focus:ring-offset-0"
            />
            <span
              className={
                checkedIndices.has(index)
                  ? 'text-white'
                  : 'text-slate-400 group-hover:text-slate-300'
              }
            >
              {item}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800/50">
        {allCheckpointsChecked ? (
          <div className="space-y-2">
            {hasProgress ? (
              <>
                <Link
                  href={`/training/${moduleSlug}/quiz?resume=1`}
                  className="block w-full py-3 rounded-xl font-medium transition-colors text-center bg-[#E67E22] hover:bg-[#d35400] text-white"
                >
                  Resume Quiz (Question {quizProgress!.currentIndex + 1}/{quizProgress!.totalQuestions})
                </Link>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Start Over
                </button>
              </>
            ) : (
              <Link href={`/training/${moduleSlug}/quiz`}>
                <button
                  type="button"
                  className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 font-medium transition-colors"
                >
                  Take Quiz →
                </button>
              </Link>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3 bg-slate-700 text-slate-500 rounded-xl cursor-not-allowed font-medium"
          >
            Complete checkpoint to take quiz
          </button>
        )}
        <p className="text-center text-sm text-slate-500 mt-2">
          {questionCount} questions · {passScore}% to pass
        </p>
      </div>
    </div>
  )
}
