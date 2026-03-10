'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getOrCreateCertificate() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('training_completed').eq('id', user.id).single()
  if (!profile?.training_completed) return { data: null, error: 'Training not completed' }

  const { data: existing } = await supabase.from('certificates').select('*').eq('user_id', user.id).single()
  if (existing) {
    let cert = existing as { modules_completed?: number | null }
    if (cert.modules_completed == null) {
      const { data: attempts } = await supabase.from('quiz_attempts').select('module_id').eq('user_id', user.id).eq('passed', true)
      const count = attempts ? new Set(attempts.map((a: { module_id: string }) => a.module_id)).size : 0
      await supabase.from('certificates').update({ modules_completed: count }).eq('user_id', user.id)
      cert = { ...cert, modules_completed: count }
    }
    return { data: cert, error: null }
  }

  const { data: attempts } = await supabase.from('quiz_attempts').select('module_id, score').eq('user_id', user.id).eq('passed', true)
  const bestByModule: Record<string, number> = {}
  for (const a of attempts ?? []) {
    const s = Number(a.score)
    if (bestByModule[a.module_id] == null || s > bestByModule[a.module_id]) bestByModule[a.module_id] = s
  }
  const scores = Object.values(bestByModule)
  const averageScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const modulesCompleted = attempts ? new Set(attempts.map((a: { module_id: string }) => a.module_id)).size : 0

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
      modules_completed: modulesCompleted,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: inserted, error: null }
}

/**
 * Sends the certificate PDF to the current user's email (successful completion notification).
 * Requires RESEND_API_KEY. Optional RESEND_FROM (e.g. "FinAcct360 Academy <onboarding@resend.dev>").
 */
export async function sendCertificateToEmail(pdfBase64: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('training_completed').eq('id', user.id).single()
  if (!profile?.training_completed) return { ok: false, error: 'Training not completed' }

  if (!process.env.RESEND_API_KEY) return { ok: false, error: 'Email is not configured. Please contact support.' }

  const from = process.env.RESEND_FROM ?? 'FinAcct360 Academy <onboarding@resend.dev>'
  const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '').replace(/^data:.*?;base64,/, '')
  if (!base64Data || base64Data.length < 100) return { ok: false, error: 'Invalid certificate data' }

  const { error } = await resend.emails.send({
    from,
    to: [user.email],
    subject: 'Your FinAcct360 Academy Certificate of Completion',
    html: `
      <p>Congratulations!</p>
      <p>You have successfully completed the FinAcct360 Academy Restaurant Accounting Training Program. Your certificate is attached to this email.</p>
      <p>Keep it for your records and share it with your team or clients as needed.</p>
      <p>— FinAcct360 Academy</p>
    `,
    attachments: [
      { filename: 'FinAcct360-Certificate.pdf', content: base64Data },
    ],
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
