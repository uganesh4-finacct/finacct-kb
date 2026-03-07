'use server'

import { createClient } from '@/lib/supabase/server'

export async function getOrCreateCertificate() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('training_completed').eq('id', user.id).single()
  if (!profile?.training_completed) return { data: null, error: 'Training not completed' }

  const { data: existing } = await supabase.from('certificates').select('*').eq('user_id', user.id).single()
  if (existing) return { data: existing, error: null }

  const { data: attempts } = await supabase.from('quiz_attempts').select('module_id, score').eq('user_id', user.id).eq('passed', true)
  const bestByModule: Record<string, number> = {}
  for (const a of attempts ?? []) {
    const s = Number(a.score)
    if (bestByModule[a.module_id] == null || s > bestByModule[a.module_id]) bestByModule[a.module_id] = s
  }
  const scores = Object.values(bestByModule)
  const averageScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  const { data: progress } = await supabase.from('training_progress').select('time_spent_seconds').eq('user_id', user.id)
  const totalTime = (progress ?? []).reduce((sum, p) => sum + (p.time_spent_seconds ?? 0), 0)

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const userIdShort = user.id.replace(/-/g, '').slice(0, 8)
  const certNumber = `FA-KB-${userIdShort}-${dateStr}`

  const { data: inserted, error } = await supabase
    .from('certificates')
    .insert({
      user_id: user.id,
      certificate_number: certNumber,
      average_score: Math.round(averageScore * 100) / 100,
      total_time_spent_seconds: totalTime,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: inserted, error: null }
}
