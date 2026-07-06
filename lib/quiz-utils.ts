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
  /** When multiple questions share a group, one is chosen at random per attempt */
  variant_group?: string | null
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

/** Pick one question per variant_group; include all questions without a group. */
export function selectQuizQuestions(questions: QuizQuestionInput[]): QuizQuestionInput[] {
  const selected: QuizQuestionInput[] = []
  const seenGroups = new Set<string>()

  for (const q of questions) {
    const group = q.variant_group?.trim()
    if (!group) {
      selected.push(q)
      continue
    }
    if (seenGroups.has(group)) continue
    seenGroups.add(group)
    const groupQuestions = questions.filter((item) => item.variant_group === group)
    const pick = groupQuestions[Math.floor(Math.random() * groupQuestions.length)]
    selected.push(pick)
  }

  return selected
}

/** Prepare quiz: apply variant groups, shuffle question order and option order. */
export function prepareQuiz(questions: QuizQuestionInput[]): PreparedQuestion[] {
  const shuffledQuestions = shuffleArray(selectQuizQuestions(questions))
  return shuffledQuestions.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }))
}
