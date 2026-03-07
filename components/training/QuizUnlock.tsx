'use client'

import Link from 'next/link'
import { Check, BookOpen } from 'lucide-react'

interface QuizUnlockProps {
  allSectionsRead: boolean
  sectionsRead: number
  totalSections: number
  moduleSlug: string
  questionCount: number
  passScore: number
}

export function QuizUnlock({
  allSectionsRead,
  sectionsRead,
  totalSections,
  moduleSlug,
  questionCount,
  passScore,
}: QuizUnlockProps) {
  return (
    <div className="mt-12 p-6 bg-slate-800/30 rounded-xl text-center border border-slate-800/50">
      {allSectionsRead ? (
        <>
          <Check size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            You&apos;ve completed this module!
          </h3>
          <p className="text-slate-400 mb-6">
            Ready to test your knowledge?
          </p>
          <Link href={`/training/${moduleSlug}/quiz`}>
            <button
              type="button"
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 font-medium transition-colors"
            >
              Take Quiz →
            </button>
          </Link>
          {questionCount > 0 && (
            <p className="text-sm text-slate-500 mt-4">
              {questionCount} questions · {passScore}% to pass
            </p>
          )}
        </>
      ) : (
        <>
          <BookOpen size={48} className="text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Keep reading
          </h3>
          <p className="text-slate-400 mb-4">
            Read all sections to unlock the quiz
          </p>
          <div className="text-sm text-slate-500">
            {sectionsRead} of {totalSections} sections read
          </div>
        </>
      )}
    </div>
  )
}
