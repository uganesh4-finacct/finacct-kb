'use server'

import { createClient } from '@/lib/supabase/server'

export async function recordModuleProgress(moduleId: string, timeSpentSeconds: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: existing } = await supabase
    .from('training_progress')
    .select('id, time_spent_seconds')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()
  if (existing) {
    await supabase
      .from('training_progress')
      .update({
        time_spent_seconds: (existing.time_spent_seconds ?? 0) + timeSpentSeconds,
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('training_progress').insert({
      user_id: user.id,
      module_id: moduleId,
      time_spent_seconds: timeSpentSeconds,
    })
  }
}

export async function recordModuleComplete(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: existing } = await supabase
    .from('training_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()
  if (existing) {
    await supabase
      .from('training_progress')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('training_progress').insert({
      user_id: user.id,
      module_id: moduleId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
  }
}

export async function submitQuizAttempt(moduleId: string, answers: Record<string, string>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated', score: 0, passed: false, upgraded: false, attemptNumber: 0 }

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, correct_option_id')
    .eq('module_id', moduleId)
    .order('order_index')

  if (!questions?.length) return { ok: false as const, error: 'No questions', score: 0, passed: false, upgraded: false }

  let correct = 0
  for (const q of questions) {
    if (answers[q.id] === q.correct_option_id) correct++
  }
  const scorePct = (correct / questions.length) * 100
  const passed = scorePct >= 80

  const { data: prevAttempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
  const attemptNumber = (prevAttempts?.length ?? 0) + 1

  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    module_id: moduleId,
    score: scorePct,
    passed,
    answers,
    attempt_number: attemptNumber,
  })
  if (error) return { ok: false as const, error: error.message, score: 0, passed: false, upgraded: false, attemptNumber }

  // Clear in-progress quiz state when attempt is submitted (pass or fail)
  await supabase.from('quiz_progress').delete().eq('user_id', user.id).eq('module_id', moduleId)

  if (passed) {
    await recordModuleComplete(moduleId)
    await clearQuizLockInternal(supabase, user.id, moduleId)
  } else if (attemptNumber >= 3) {
    const nextRetryAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { data: progressRow } = await supabase
      .from('training_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .single()
    if (progressRow) {
      await supabase
        .from('training_progress')
        .update({ next_retry_at: nextRetryAt })
        .eq('id', progressRow.id)
    } else {
      await supabase.from('training_progress').insert({
        user_id: user.id,
        module_id: moduleId,
        next_retry_at: nextRetryAt,
      })
    }
  }

  let upgraded = false
  if (passed) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('training_completed, role')
      .eq('id', user.id)
      .maybeSingle()
    upgraded = profile?.training_completed === true && (profile?.role as string) === 'accountant'
  }

  return { ok: true as const, score: scorePct, passed, upgraded, attemptNumber }
}

async function clearQuizLockInternal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  moduleId: string
) {
  const { data: row } = await supabase
    .from('training_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single()
  if (row) {
    await supabase
      .from('training_progress')
      .update({ next_retry_at: null })
      .eq('id', row.id)
  }
}

export async function getQuizLockStatus(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { locked: false, nextRetryAt: null }
  const { data: row } = await supabase
    .from('training_progress')
    .select('next_retry_at')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()
  const nextRetryAt = row?.next_retry_at ?? null
  const locked = nextRetryAt != null && new Date(nextRetryAt) > new Date()
  return { locked, nextRetryAt }
}

export async function clearQuizLock(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await clearQuizLockInternal(supabase, user.id, moduleId)
}

// ---- Quiz progress (resume) ----

export type QuizProgressRow = {
  id: string
  current_question_index: number
  question_ids: string[]
  answers: string[]
  started_at: string
  updated_at: string
}

export async function getQuizProgress(moduleId: string): Promise<QuizProgressRow | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('quiz_progress')
    .select('id, current_question_index, question_ids, answers, started_at, updated_at')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    current_question_index: data.current_question_index ?? 0,
    question_ids: Array.isArray(data.question_ids) ? data.question_ids : [],
    answers: Array.isArray(data.answers) ? data.answers : [],
    started_at: data.started_at ?? '',
    updated_at: data.updated_at ?? '',
  }
}

export async function getQuizProgressForUser(): Promise<Array<QuizProgressRow & { module_id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('quiz_progress')
    .select('id, module_id, current_question_index, question_ids, answers, started_at, updated_at')
    .eq('user_id', user.id)
  if (!data?.length) return []
  return data.map((row) => ({
    id: row.id,
    module_id: row.module_id,
    current_question_index: row.current_question_index ?? 0,
    question_ids: Array.isArray(row.question_ids) ? row.question_ids : [],
    answers: Array.isArray(row.answers) ? row.answers : [],
    started_at: row.started_at ?? '',
    updated_at: row.updated_at ?? '',
  }))
}

export async function saveQuizProgress(
  moduleId: string,
  currentQuestionIndex: number,
  answers: string[],
  questionIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }
  const { error } = await supabase
    .from('quiz_progress')
    .upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        current_question_index: currentQuestionIndex,
        answers,
        question_ids: questionIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id' }
    )
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function clearQuizProgress(moduleId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('quiz_progress').delete().eq('user_id', user.id).eq('module_id', moduleId)
}

/** Create or reset quiz progress (e.g. when starting quiz). questionIds = ordered question ids for this attempt. */
export async function startOrResetQuizProgress(moduleId: string, questionIds: string[]): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }
  const { error } = await supabase
    .from('quiz_progress')
    .upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        current_question_index: 0,
        answers: [],
        question_ids: questionIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id' }
    )
  return error ? { ok: false, error: error.message } : { ok: true }
}
