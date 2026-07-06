'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth-helpers'
import {
  autoPassG1IfEligible,
  buildGateStatusList,
  fetchUserGates,
  isCourseworkCompleteForUser,
  isFullyCertified,
  getCourseworkProgress,
} from '@/lib/certification'
import type { CertificationGateId } from '@/lib/certification-constants'
import { Resend } from 'resend'
import { ACADEMY_EMAIL_FROM } from '@/lib/certification-constants'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function checkAndAutoPassG1() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated' }
  const result = await autoPassG1IfEligible(supabase, user.id)
  if (result.newlyPassed) {
    revalidatePath('/certification')
    revalidatePath('/training')
    revalidatePath('/home')
  }
  return { ok: true as const, ...result }
}

export async function getMyCertificationStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  await autoPassG1IfEligible(supabase, user.id)

  const gates = await fetchUserGates(supabase, user.id)
  const gateList = await buildGateStatusList(supabase, user.id, gates)
  const coursework = await getCourseworkProgress(supabase, user.id)
  const courseworkComplete = await isCourseworkCompleteForUser(supabase, user.id)
  const fullyCertified = isFullyCertified(gates)

  return {
    data: {
      gates: gateList,
      coursework,
      courseworkComplete,
      fullyCertified,
      g1Passed: gates.some((g) => g.gate === 'G1' && g.status === 'passed'),
    },
    error: null,
  }
}

export async function getTraineeCertificationMatrix() {
  const check = await ensureAdmin()
  if (!check.ok) return { data: null, error: check.error }

  const supabase = await createClient()
  const { data: trainees } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('role', 'trainee')
    .order('full_name', { ascending: true })

  if (!trainees?.length) return { data: [], error: null }

  const ids = trainees.map((t) => t.id)
  const { data: allGates } = await supabase
    .from('certification_gates')
    .select('*')
    .in('user_id', ids)

  const gatesByUser: Record<string, Awaited<ReturnType<typeof fetchUserGates>>> = {}
  for (const g of allGates ?? []) {
    if (!gatesByUser[g.user_id]) gatesByUser[g.user_id] = []
    gatesByUser[g.user_id].push(g as Awaited<ReturnType<typeof fetchUserGates>>[number])
  }

  const rows = await Promise.all(
    trainees.map(async (t) => {
      const gates = gatesByUser[t.id] ?? []
      const gateList = await buildGateStatusList(supabase, t.id, gates)
      const coursework = await getCourseworkProgress(supabase, t.id)
      return {
        id: t.id,
        fullName: t.full_name || t.email,
        email: t.email,
        gates: gateList,
        coursework,
        fullyCertified: isFullyCertified(gates),
      }
    })
  )

  return { data: rows, error: null }
}

export async function markGatePassed(
  userId: string,
  gate: CertificationGateId,
  notes?: string
) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }

  if (gate === 'G1') {
    return { ok: false as const, error: 'G1 is automatic and cannot be signed manually' }
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { error } = await supabase.from('certification_gates').upsert(
    {
      user_id: userId,
      gate,
      status: 'passed',
      signed_by: check.userId,
      signed_at: now,
      notes: notes?.trim() || null,
    },
    { onConflict: 'user_id,gate' }
  )

  if (error) return { ok: false as const, error: error.message }

  const gates = await fetchUserGates(supabase, userId)
  const allPassed = isFullyCertified(gates)

  revalidatePath('/admin/certification')
  revalidatePath('/certification')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', userId)
    .single()

  return {
    ok: true as const,
    allPassed,
    userName: profile?.full_name || profile?.email || 'Trainee',
    userRole: profile?.role,
    gate,
  }
}

export async function promoteTraineeToAccountant(userId: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }

  const supabase = await createClient()
  const gates = await fetchUserGates(supabase, userId)
  if (!isFullyCertified(gates)) {
    return { ok: false as const, error: 'All six gates must be passed before promotion' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, full_name')
    .eq('id', userId)
    .single()

  if (profile?.role !== 'trainee') {
    return { ok: false as const, error: 'User is not a trainee' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({
      role: 'accountant',
      training_completed: true,
      training_completed_at: now,
      certificate_issued: true,
      updated_at: now,
    })
    .eq('id', userId)

  if (error) return { ok: false as const, error: error.message }

  if (resend && profile?.email) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? ACADEMY_EMAIL_FROM,
        to: [profile.email],
        subject: 'FCRA Certification Complete — FinAcct360 Academy',
        html: `
          <p>Congratulations, ${profile.full_name || 'team member'}!</p>
          <p>You have completed all six FCRA certification gates and been promoted to <strong>Accountant</strong> at FinAcct360 Academy.</p>
          <p>Your FCRA certificate is now available in the Academy.</p>
          <p>— FinAcct360 Academy</p>
        `,
      })
    } catch {
      // non-blocking
    }
  }

  revalidatePath('/admin/certification')
  revalidatePath('/certification')
  revalidatePath('/certificate')
  revalidatePath('/home')

  return { ok: true as const }
}

export async function isUserFullyCertified(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const gates = await fetchUserGates(supabase, userId)
  return isFullyCertified(gates)
}
