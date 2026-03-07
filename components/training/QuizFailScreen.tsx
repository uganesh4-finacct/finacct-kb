'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, X } from 'lucide-react'
import { clearCheckpointsForModule } from '@/components/training/Checkpoint'

export interface WrongTopic {
  topic: string
  sectionSlug: string
  missedCount: number
}

interface QuizFailScreenProps {
  score: number
  total: number
  wrongTopics: WrongTopic[]
  attemptNumber: number
  maxAttempts: number
  moduleId: string
  moduleSlug: string
  onRetake: () => void
}

export function QuizFailScreen({
  score,
  total,
  wrongTopics,
  attemptNumber,
  maxAttempts,
  moduleId,
  moduleSlug,
  onRetake,
}: QuizFailScreenProps) {
  const router = useRouter()
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  function handleReviewModule() {
    clearCheckpointsForModule(moduleId)
    router.push(`/training/${moduleSlug}`)
  }

  return (
    <div className="max-w-xl mx-auto text-center py-8">
      <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen size={40} className="text-yellow-500" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Almost There!</h2>
      <p className="text-slate-400 mb-1">
        You scored {score}/{total} ({percentage}%)
      </p>
      <p className="text-slate-500 mb-6">Need 80% to pass</p>

      {wrongTopics.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4 mb-6 text-left border border-slate-800/50">
          <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-3">
            Areas to Review
          </h3>
          <div className="space-y-3">
            {wrongTopics.map((topic, idx) => (
              <div key={`${topic.sectionSlug}-${idx}`} className="flex items-start gap-3">
                <X size={18} className="text-red-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white break-words">{topic.topic}</p>
                  <p className="text-sm text-slate-500">
                    Missed {topic.missedCount} question{topic.missedCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          type="button"
          onClick={handleReviewModule}
          className="px-6 py-3 border border-slate-600 rounded-xl hover:bg-slate-800 text-slate-300 font-medium transition-colors"
        >
          Review Sections
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 font-medium transition-colors"
        >
          Retake Quiz
        </button>
      </div>

      <p className="text-sm text-slate-500">
        Attempt {attemptNumber} of {maxAttempts}
      </p>
    </div>
  )
}
