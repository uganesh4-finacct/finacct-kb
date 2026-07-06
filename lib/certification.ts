import type { SupabaseClient } from '@supabase/supabase-js'
import {
  CERTIFICATION_GATE_IDS,
  type CertificationGateId,
  GATE_DEFINITIONS,
} from '@/lib/certification-constants'

export type CertificationGateRow = {
  id: string
  user_id: string
  gate: CertificationGateId
  status: 'pending' | 'passed'
  signed_by: string | null
  signed_at: string | null
  notes: string | null
}

export type GateStatusItem = {
  gate: CertificationGateId
  definition: (typeof GATE_DEFINITIONS)[number]
  status: 'pending' | 'passed'
  signed_at: string | null
  signed_by_name: string | null
  notes: string | null
}

/** Published training modules that must be passed for G1 (all module quizzes). */
export async function getPublishedModuleIds(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase
    .from('training_modules')
    .select('id')
    .eq('is_published', true)
  return (data ?? []).map((m) => m.id)
}

/** True when every published module has at least one passed quiz attempt. */
export async function isCourseworkCompleteForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const moduleIds = await getPublishedModuleIds(supabase)
  if (moduleIds.length === 0) return false

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('module_id')
    .eq('user_id', userId)
    .eq('passed', true)
    .in('module_id', moduleIds)

  const passedSet = new Set((attempts ?? []).map((a) => a.module_id))
  return moduleIds.every((id) => passedSet.has(id))
}

export async function getCourseworkProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<{ passed: number; total: number }> {
  const moduleIds = await getPublishedModuleIds(supabase)
  if (moduleIds.length === 0) return { passed: 0, total: 0 }

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('module_id')
    .eq('user_id', userId)
    .eq('passed', true)
    .in('module_id', moduleIds)

  const passedSet = new Set((attempts ?? []).map((a) => a.module_id))
  return { passed: passedSet.size, total: moduleIds.length }
}

export function isFullyCertified(gates: CertificationGateRow[]): boolean {
  return CERTIFICATION_GATE_IDS.every((g) =>
    gates.some((row) => row.gate === g && row.status === 'passed')
  )
}

export function isG1Passed(gates: CertificationGateRow[]): boolean {
  return gates.some((row) => row.gate === 'G1' && row.status === 'passed')
}

export async function fetchUserGates(
  supabase: SupabaseClient,
  userId: string
): Promise<CertificationGateRow[]> {
  const { data } = await supabase
    .from('certification_gates')
    .select('*')
    .eq('user_id', userId)
  return (data ?? []) as CertificationGateRow[]
}

export async function buildGateStatusList(
  supabase: SupabaseClient,
  userId: string,
  gates: CertificationGateRow[]
): Promise<GateStatusItem[]> {
  const signerIds = [...new Set(gates.map((g) => g.signed_by).filter(Boolean))] as string[]
  const signerNames: Record<string, string> = {}
  if (signerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', signerIds)
    for (const p of profiles ?? []) {
      signerNames[p.id] = p.full_name?.trim() || p.email || 'Staff'
    }
  }

  return GATE_DEFINITIONS.map((def) => {
    const row = gates.find((g) => g.gate === def.id)
    return {
      gate: def.id,
      definition: def,
      status: row?.status ?? 'pending',
      signed_at: row?.signed_at ?? null,
      signed_by_name: row?.signed_by ? signerNames[row.signed_by] ?? null : def.auto ? 'Automatic' : null,
      notes: row?.notes ?? null,
    }
  })
}

/** Auto-tick G1 when coursework is complete via SECURITY DEFINER RPC. */
export async function autoPassG1IfEligible(
  supabase: SupabaseClient,
  userId: string
): Promise<{ passed: boolean; newlyPassed: boolean }> {
  const wasComplete = await isCourseworkCompleteForUser(supabase, userId)
  if (!wasComplete) return { passed: false, newlyPassed: false }

  const gatesBefore = await fetchUserGates(supabase, userId)
  const hadG1 = isG1Passed(gatesBefore)

  const { data, error } = await supabase.rpc('auto_pass_g1_if_eligible', { p_user_id: userId })
  if (error) {
    console.error('[autoPassG1IfEligible]', error.message)
    return { passed: hadG1, newlyPassed: false }
  }

  const passed = data === true || hadG1
  return { passed, newlyPassed: passed && !hadG1 }
}
