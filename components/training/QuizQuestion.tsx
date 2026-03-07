'use client'

import { QuizFeedback } from './QuizFeedback'

export type QuizQuestionData = {
  id: string
  question: string
  options: { id: string; text: string }[]
  correct_option_id: string
  explanation: string | null
  order_index: number
}

type OptionState = 'default' | 'selected' | 'correct' | 'wrong'

export function QuizQuestion({
  question,
  selectedAnswer,
  submittedAnswer,
  onSelect,
  disabled,
  showFeedback,
}: {
  question: QuizQuestionData
  selectedAnswer: string | null
  submittedAnswer: string | null
  onSelect: (optionId: string) => void
  disabled: boolean
  showFeedback: boolean
}) {
  const getOptionState = (optionId: string): OptionState => {
    if (!submittedAnswer) {
      return selectedAnswer === optionId ? 'selected' : 'default'
    }
    if (optionId === question.correct_option_id) return 'correct'
    if (optionId === submittedAnswer) return 'wrong'
    return 'default'
  }

  const optionStyles: Record<OptionState, string> = {
    default: 'border-slate-600 hover:bg-slate-700/50 hover:border-slate-500',
    selected: 'border-indigo-500 bg-indigo-500/10',
    correct: 'border-green-500 bg-green-500/10',
    wrong: 'border-rose-500 bg-rose-500/10',
  }

  const correctOptionText = question.options.find((o) => o.id === question.correct_option_id)?.text ?? null
  const userAnswerText = submittedAnswer
    ? question.options.find((o) => o.id === submittedAnswer)?.text ?? null
    : null

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-6 break-words">{question.question}</h2>
      <ul className="space-y-3">
        {question.options.map((opt) => {
          const state = getOptionState(opt.id)
          const isDisabled = disabled
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => !isDisabled && onSelect(opt.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition break-words text-left ${
                  optionStyles[state]
                } ${isDisabled ? 'cursor-default opacity-90' : 'cursor-pointer hover:border-slate-500'}`}
              >
                <span className="flex items-center justify-between gap-3 w-full text-left break-words text-base">
                  <span className="text-white break-words">{opt.text}</span>
                  {disabled && state === 'correct' && (
                    <span className="shrink-0 text-green-400 font-medium text-sm">✅ CORRECT</span>
                  )}
                  {disabled && state === 'wrong' && (
                    <span className="shrink-0 text-rose-400 font-medium text-sm">❌ YOUR ANS</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {showFeedback && submittedAnswer != null && (
        <QuizFeedback
          isCorrect={submittedAnswer === question.correct_option_id}
          explanation={question.explanation}
          correctAnswerText={correctOptionText ?? undefined}
          userAnswerText={userAnswerText ?? undefined}
        />
      )}
    </>
  )
}
