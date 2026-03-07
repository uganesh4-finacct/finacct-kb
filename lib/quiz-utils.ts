/**
 * Quiz shuffle and preparation utilities.
 * Fisher-Yates shuffle for questions and answer options.
 */

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestionInput {
  id: string
  question: string
  options: QuizOption[]
  correct_option_id: string
  explanation: string | null
  order_index: number
}

export type PreparedQuestion = QuizQuestionInput

/** Shuffle array in place (Fisher-Yates) and return. */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** Prepare quiz: shuffle question order and option order. correct_option_id unchanged for checking. */
export function prepareQuiz(questions: QuizQuestionInput[]): PreparedQuestion[] {
  const shuffledQuestions = shuffleArray(questions)
  return shuffledQuestions.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }))
}
