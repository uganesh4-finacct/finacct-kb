'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { submitQuizAttempt } from '@/lib/training-actions'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import { QuizQuestion } from '@/components/training/QuizQuestion'
import { QuizCompletePass } from '@/components/training/QuizComplete'
import { QuizFailScreen } from '@/components/training/QuizFailScreen'
import { QuizLocked } from '@/components/training/QuizLocked'
import { prepareQuiz } from '@/lib/quiz-utils'
import type { QuizQuestionInput } from '@/lib/quiz-utils'

type QuizQuestionType = QuizQuestionInput
const MAX_ATTEMPTS = 3

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const PASS_SCORE = 80

export function QuizClient({
  moduleId,
  moduleTitle,
  moduleSlug,
  moduleNumber,
  totalModules,
  estimatedMinutes,
  questions: initialQuestions,
  nextModuleSlug,
  nextModuleTitle = null,
  lockStatus = { locked: false, nextRetryAt: null },
}: {
  moduleId: string
  moduleTitle: string
  moduleSlug: string
  moduleNumber: number
  totalModules: number
  estimatedMinutes: number
  questions: QuizQuestionType[]
  nextModuleSlug: string | null
  nextModuleTitle?: string | null
  lockStatus?: { locked: boolean; nextRetryAt: string | null }
}) {
  const [questions, setQuestions] = useState<QuizQuestionType[]>(() =>
    prepareQuiz(initialQuestions)
  )
  const [quizStarted, setQuizStarted] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [step, setStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [finalSubmitted, setFinalSubmitted] = useState<{
    score: number
    passed: boolean
    correctCount: number
    upgraded?: boolean
    attemptNumber?: number
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const currentQ = questions[step]
  const isLast = step === questions.length - 1
  const hasSubmittedCurrent = currentQ && answers[currentQ.id] !== undefined
  const correctCountSoFar = questions.slice(0, step + 1).filter((q) => answers[q.id] === q.correct_option_id).length

  useEffect(() => {
    if (!quizStarted || finalSubmitted !== null || !startedAt) return
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAt)
    }, 1000)
    setElapsedMs(Date.now() - startedAt)
    return () => clearInterval(interval)
  }, [quizStarted, finalSubmitted, startedAt])

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!quizStarted || finalSubmitted !== null) return
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [quizStarted, finalSubmitted, handleBeforeUnload])

  function handleStartQuiz() {
    setQuizStarted(true)
    setStartedAt(Date.now())
  }

  function handleSelectAnswer(optionId: string) {
    if (hasSubmittedCurrent) return
    setSelectedAnswer(optionId)
  }

  function handleSubmit() {
    if (!currentQ || selectedAnswer == null) return
    setAnswers((a) => ({ ...a, [currentQ.id]: selectedAnswer }))
  }

  function handleNext() {
    if (!hasSubmittedCurrent) return
    if (isLast) {
      setSubmitting(true)
      submitQuizAttempt(moduleId, answers).then((res) => {
        setSubmitting(false)
        if (res.ok) {
          const correctCount = questions.filter((q) => answers[q.id] === q.correct_option_id).length
          setFinalSubmitted({
            score: res.score,
            passed: res.passed,
            correctCount,
            upgraded: res.upgraded ?? false,
            attemptNumber: res.attemptNumber ?? 1,
          })
        }
      })
    } else {
      setSelectedAnswer(null)
      setStep((s) => s + 1)
    }
  }

  function handleRetake() {
    setFinalSubmitted(null)
    setStep(0)
    setAnswers({})
    setSelectedAnswer(null)
    setStartedAt(Date.now())
  }

  // Wrong answers for "Areas to Review" on fail screen (topic = question snippet, sectionSlug = module)
  const wrongTopics = useMemo(() => {
    return questions
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correct_option_id)
      .map((q) => ({
        topic: q.question.length > 80 ? q.question.slice(0, 80) + '…' : q.question,
        sectionSlug: moduleSlug,
        missedCount: 1,
      }))
  }, [questions, answers, moduleSlug])

  if (lockStatus.locked && lockStatus.nextRetryAt) {
    return (
      <div className="rounded-2xl border border-slate-800/50 bg-slate-800/30 p-8 w-full max-w-xl mx-auto page-content">
        <QuizLocked nextRetryAt={lockStatus.nextRetryAt} moduleSlug={moduleSlug} />
      </div>
    )
  }

  // —— Pre-quiz screen ——
  if (!quizStarted) {
    return (
      <div className="rounded-2xl border border-slate-800/50 bg-slate-800/30 p-8 w-full max-w-xl mx-auto page-content">
        <h1 className="text-2xl font-semibold text-white mb-2">Quiz: {moduleTitle}</h1>
        <ul className="text-base text-slate-400 space-y-2 mb-6">
          <li><strong className="text-slate-300">{questions.length}</strong> questions</li>
          <li>About <strong className="text-slate-300">{estimatedMinutes}</strong> min</li>
          <li>Pass requirement: <strong className="text-slate-300">{PASS_SCORE}%</strong></li>
          <li className="text-slate-500">You can retake if needed.</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleStartQuiz}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Start Quiz
          </button>
          <Link
            href={`/training/${moduleSlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Review
          </Link>
        </div>
      </div>
    )
  }

  // —— Quiz complete: pass or fail ——
  if (finalSubmitted !== null) {
    const { score, passed, correctCount, upgraded } = finalSubmitted
    const timeSpentFormatted = startedAt != null ? formatElapsed(Date.now() - startedAt) : undefined
    if (passed) {
      return (
        <QuizCompletePass
          correctCount={correctCount}
          totalQuestions={questions.length}
          scorePct={score}
          moduleNumber={moduleNumber}
          totalModules={totalModules}
          nextModuleSlug={nextModuleSlug}
          nextModuleTitle={nextModuleTitle}
          moduleSlug={moduleSlug}
          timeSpentFormatted={timeSpentFormatted}
          trainingJustCompleted={upgraded}
        />
      )
    }
    return (
      <div className="rounded-2xl border border-slate-800/50 bg-slate-800/30 p-8 w-full max-w-xl mx-auto page-content">
        <QuizFailScreen
          score={correctCount}
          total={questions.length}
          wrongTopics={wrongTopics}
          attemptNumber={finalSubmitted.attemptNumber ?? 1}
          maxAttempts={MAX_ATTEMPTS}
          moduleId={moduleId}
          moduleSlug={moduleSlug}
          onRetake={handleRetake}
        />
      </div>
    )
  }

  // —— Active quiz: one question per screen ——
  return (
    <div className="rounded-2xl border border-slate-800/50 bg-slate-800/30 p-8 overflow-hidden w-full max-w-xl mx-auto page-content">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-6" aria-label={`Question ${step + 1} of ${questions.length}`}>
        {questions.map((_, i) => (
          <span
            key={i}
            className={`inline-block w-2.5 h-2.5 rounded-full transition-colors ${
              i < step ? 'bg-green-500' : i === step ? 'bg-indigo-500' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-slate-400 mb-4">
        Question {step + 1} of {questions.length}
      </p>
      {startedAt !== null && (
        <p className="text-sm text-slate-500 tabular-nums mb-6">Elapsed: {formatElapsed(elapsedMs)}</p>
      )}

      <QuizQuestion
        question={currentQ}
        selectedAnswer={selectedAnswer}
        submittedAnswer={hasSubmittedCurrent ? answers[currentQ.id] ?? null : null}
        onSelect={handleSelectAnswer}
        disabled={hasSubmittedCurrent}
        showFeedback={hasSubmittedCurrent}
      />

      {!hasSubmittedCurrent ? (
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedAnswer == null}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </div>
      ) : (
        <>
          <p className="text-base text-slate-400 mt-6">
            <span className="font-medium text-white">{correctCountSoFar}/{step + 1}</span> correct so far
          </p>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting…' : isLast ? 'See Results' : 'Next Question'}
              {!submitting && !isLast && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
