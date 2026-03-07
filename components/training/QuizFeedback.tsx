'use client'

export function QuizFeedback({
  isCorrect,
  explanation,
  correctAnswerText,
  userAnswerText,
}: {
  isCorrect: boolean
  explanation: string | null
  correctAnswerText?: string
  userAnswerText?: string
}) {
  return (
    <div
      className={`rounded-xl border p-6 overflow-hidden mt-6 ${
        isCorrect
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-rose-500/10 border-rose-500/30'
      }`}
    >
      <p className={`text-lg font-semibold mb-4 ${isCorrect ? 'text-green-400' : 'text-rose-400'}`}>
        {isCorrect ? '✅ Correct!' : '❌ Not quite'}
      </p>

      {!isCorrect && (correctAnswerText != null || userAnswerText != null) && (
        <div className="mb-4 space-y-1 text-sm">
          {userAnswerText != null && (
            <p className="text-slate-300">
              You selected: <span className="text-rose-300">{userAnswerText}</span>
            </p>
          )}
          {correctAnswerText != null && (
            <p className="text-slate-300">
              The correct answer is <span className="text-green-300">{correctAnswerText}</span>.
            </p>
          )}
        </div>
      )}

      {explanation && (
        <p className="text-slate-300 leading-relaxed">{explanation}</p>
      )}
    </div>
  )
}
