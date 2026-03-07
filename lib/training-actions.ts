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
