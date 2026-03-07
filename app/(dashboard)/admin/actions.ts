'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/lib/types'

export async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { ok: false as const, error: 'Admin only' }
  return { ok: true as const, userId: user.id }
}

// ---- Team ----
export async function getTeamProfiles() {
  const check = await ensureAdmin()
  if (!check.ok) return { data: null, error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error: error?.message }
}

export async function getQuizStatsByUser() {
  const check = await ensureAdmin()
  if (!check.ok) return { data: {} as Record<string, { avgScore: number; failedCount: number }>, error: check.error }
  const supabase = await createClient()
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('user_id, score, passed')
  const byUser: Record<string, { scores: number[]; failed: number }> = {}
  for (const a of attempts ?? []) {
    if (!byUser[a.user_id]) byUser[a.user_id] = { scores: [], failed: 0 }
    byUser[a.user_id].scores.push(Number(a.score))
    if (!a.passed) byUser[a.user_id].failed += 1
  }
  const result: Record<string, { avgScore: number; failedCount: number }> = {}
  for (const [uid, v] of Object.entries(byUser)) {
    const avg = v.scores.length ? v.scores.reduce((s, n) => s + n, 0) / v.scores.length : 0
    result[uid] = { avgScore: Math.round(avg * 100) / 100, failedCount: v.failed }
  }
  return { data: result, error: null }
}

export async function inviteUser(formData: FormData) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  if (!hasAdminClient()) return { ok: false as const, error: 'Server not configured for invites. Add SUPABASE_SERVICE_ROLE_KEY.' }
  const email = formData.get('email') as string
  const fullName = (formData.get('full_name') as string) || 'New User'
  const role = (formData.get('role') as UserRole) || 'trainee'
  if (!email?.trim()) return { ok: false as const, error: 'Email required' }
  try {
    const admin = createAdminClient()
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
      data: { full_name: fullName.trim(), role },
    })
    if (inviteError) return { ok: false as const, error: inviteError.message }
    if (inviteData?.user) {
      const { error: profileError } = await admin
        .from('profiles')
        .update({ full_name: fullName.trim(), role })
        .eq('id', inviteData.user.id)
      if (profileError) {
        // Profile may be created by trigger with default role; ignore or log
      }
    }
    revalidatePath('/admin/team')
    revalidatePath('/admin')
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Invite failed' }
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/team')
  return { ok: true as const }
}

export async function deleteUser(userId: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  if (!hasAdminClient()) return { ok: false as const, error: 'Server not configured. Add SUPABASE_SERVICE_ROLE_KEY to delete users.' }
  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) return { ok: false as const, error: error.message }
    revalidatePath('/admin/team')
    revalidatePath('/admin/users')
    revalidatePath('/admin')
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Delete failed' }
  }
}

// ---- User management (create without email, update profile, reset password) ----
function generateTempPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%'
  let s = ''
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/** Create auth user with temp password + profile. No invite email. Returns temp password once. */
export async function createUserDirect(formData: FormData) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error, tempPassword: undefined }
  if (!hasAdminClient()) return { ok: false as const, error: 'Server not configured. Add SUPABASE_SERVICE_ROLE_KEY.', tempPassword: undefined }
  const email = (formData.get('email') as string)?.trim()
  const fullName = (formData.get('full_name') as string)?.trim() || 'New User'
  const role = ((formData.get('role') as string) || 'trainee') as UserRole
  if (!email) return { ok: false as const, error: 'Email required', tempPassword: undefined }
  const tempPassword = generateTempPassword()
  try {
    const admin = createAdminClient()
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    })
    if (authError) return { ok: false as const, error: authError.message, tempPassword: undefined }
    if (!authData?.user) return { ok: false as const, error: 'User not created', tempPassword: undefined }
    await admin
      .from('profiles')
      .update({ full_name: fullName, role, updated_at: new Date().toISOString() })
      .eq('id', authData.user.id)
    revalidatePath('/admin/users')
    revalidatePath('/admin/team')
    revalidatePath('/admin')
    return { ok: true as const, tempPassword, userId: authData.user.id }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Create failed', tempPassword: undefined }
  }
}

/** Update profile: full_name, role, is_active (if column exists). */
export async function updateUserProfile(
  userId: string,
  updates: { full_name?: string; role?: UserRole; is_active?: boolean }
) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    ...(updates.full_name !== undefined && { full_name: updates.full_name }),
    ...(updates.role !== undefined && { role: updates.role }),
    ...(updates.is_active !== undefined && { is_active: updates.is_active }),
  }
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/users')
  revalidatePath('/admin/team')
  return { ok: true as const }
}

/** Generate new temp password for user. Requires service role. Returns password once. */
export async function resetUserPassword(userId: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error, tempPassword: undefined }
  if (!hasAdminClient()) return { ok: false as const, error: 'Server not configured.', tempPassword: undefined }
  const tempPassword = generateTempPassword()
  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, { password: tempPassword })
    if (error) return { ok: false as const, error: error.message, tempPassword: undefined }
    revalidatePath('/admin/users')
    return { ok: true as const, tempPassword }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Reset failed', tempPassword: undefined }
  }
}

// ---- Sections ----
export async function getSectionsAdmin() {
  const check = await ensureAdmin()
  if (!check.ok) return { data: null, error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase.from('kb_sections').select('*').order('order_index', { ascending: true })
  return { data, error: error?.message }
}

export async function getSectionArticleCounts() {
  const check = await ensureAdmin()
  if (!check.ok) return { data: {} as Record<string, number>, error: check.error }
  const supabase = await createClient()
  const { data: articles } = await supabase.from('kb_articles').select('section_id')
  const counts: Record<string, number> = {}
  for (const a of articles ?? []) {
    counts[a.section_id] = (counts[a.section_id] ?? 0) + 1
  }
  return { data: counts, error: null }
}

export async function createSection(formData: FormData) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const title = (formData.get('title') as string)?.trim()
  if (!title) return { ok: false as const, error: 'Title required' }
  const slug = (formData.get('slug') as string)?.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const description = (formData.get('description') as string)?.trim() || null
  const icon = (formData.get('icon') as string) || 'fa-folder'
  const color = (formData.get('color') as string) || 'blue'
  const gradient = (formData.get('gradient') as string) || 'from-blue-500 to-blue-600'
  const is_training_section = formData.get('is_training_section') === 'true'
  const order_index = parseInt((formData.get('order_index') as string) || '0', 10)
  const supabase = await createClient()
  const { error } = await supabase.from('kb_sections').insert({
    title,
    slug,
    description,
    icon,
    color,
    gradient,
    is_training_section,
    order_index,
    is_published: false,
  })
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/sections')
  revalidatePath('/admin')
  return { ok: true as const }
}

export async function updateSection(
  id: string,
  updates: { title?: string; slug?: string; description?: string | null; icon?: string; color?: string; gradient?: string; is_published?: boolean; order_index?: number }
) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  const { error } = await supabase.from('kb_sections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/sections')
  revalidatePath('/admin')
  return { ok: true as const }
}

export async function deleteSection(id: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  const { error } = await supabase.from('kb_sections').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/sections')
  revalidatePath('/admin')
  return { ok: true as const }
}

// ---- Articles ----
export async function getArticlesAdmin(sectionId?: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { data: null, error: check.error }
  const supabase = await createClient()
  let q = supabase
    .from('kb_articles')
    .select(`
      *,
      kb_sections ( id, title, slug )
    `)
    .order('updated_at', { ascending: false })
  if (sectionId) q = q.eq('section_id', sectionId)
  const { data, error } = await q
  return { data, error: error?.message }
}

export async function getSectionsForSelect() {
  const check = await ensureAdmin()
  if (!check.ok) return { data: [], error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase.from('kb_sections').select('id, title, slug').order('order_index')
  return { data: data ?? [], error: error?.message }
}

export async function getArticleById(id: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { data: null, error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kb_articles')
    .select('*, kb_sections(id, title, slug)')
    .eq('id', id)
    .single()
  return { data, error: error?.message }
}

export async function saveArticle(params: {
  id?: string
  section_id: string
  title: string
  slug: string
  content: unknown
  excerpt: string | null
  is_published: boolean
  order_index: number
}) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error, id: undefined }
  const supabase = await createClient()
  const userId = check.userId!
  const payload = {
    section_id: params.section_id,
    title: params.title,
    slug: params.slug,
    content: params.content ?? null,
    excerpt: params.excerpt || null,
    is_published: params.is_published,
    order_index: params.order_index,
    author: 'FinAcct Controller',
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }
  if (params.id) {
    const { data: existing } = await supabase.from('kb_articles').select('content, version').eq('id', params.id).single()
    if (existing?.content) {
      await supabase.from('kb_article_versions').insert({
        article_id: params.id,
        content: existing.content,
        version: existing.version,
        saved_by: userId,
      })
    }
    const { error } = await supabase
      .from('kb_articles')
      .update({ ...payload, version: (existing?.version ?? 1) + 1 })
      .eq('id', params.id)
    if (error) return { ok: false as const, error: error.message, id: undefined }
    revalidatePath('/admin/articles')
    revalidatePath(`/admin/articles/${params.id}`)
    return { ok: true as const, id: params.id }
  } else {
    const { data: inserted, error } = await supabase
      .from('kb_articles')
      .insert({ ...payload, created_by: userId })
      .select('id')
      .single()
    if (error) return { ok: false as const, error: error.message, id: undefined }
    revalidatePath('/admin/articles')
    return { ok: true as const, id: inserted?.id }
  }
}

export async function getArticleVersions(articleId: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { data: [], error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kb_article_versions')
    .select('*')
    .eq('article_id', articleId)
    .order('saved_at', { ascending: false })
  return { data: data ?? [], error: error?.message }
}

export async function restoreArticleVersion(articleId: string, versionId: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  const { data: ver } = await supabase.from('kb_article_versions').select('content').eq('id', versionId).single()
  if (!ver?.content) return { ok: false as const, error: 'Version not found' }
  const { error } = await supabase
    .from('kb_articles')
    .update({ content: ver.content, updated_at: new Date().toISOString(), updated_by: check.userId })
    .eq('id', articleId)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath(`/admin/articles/${articleId}`)
  return { ok: true as const }
}

// ---- Training ----
export async function getTrainingModuleById(moduleId: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { data: null, error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_modules')
    .select('*')
    .eq('id', moduleId)
    .single()
  return { data, error: error?.message }
}

export async function getTrainingModulesAdmin() {
  const check = await ensureAdmin()
  if (!check.ok) return { data: null, error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_modules')
    .select('*')
    .order('order_index', { ascending: true })
  return { data, error: error?.message }
}

export async function getQuizQuestions(moduleId: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { data: [], error: check.error }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true })
  return { data: data ?? [], error: error?.message }
}

export async function saveTrainingModule(params: {
  id?: string
  title: string
  slug: string
  description: string | null
  content: unknown
  order_index: number
  estimated_minutes: number
  is_published: boolean
}) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error, id: undefined }
  const supabase = await createClient()
  const payload = {
    title: params.title,
    slug: params.slug,
    description: params.description || null,
    content: params.content ?? null,
    order_index: params.order_index,
    estimated_minutes: params.estimated_minutes,
    is_published: params.is_published,
    updated_at: new Date().toISOString(),
  }
  if (params.id) {
    const { error } = await supabase.from('training_modules').update(payload).eq('id', params.id)
    if (error) return { ok: false as const, error: error.message, id: undefined }
    revalidatePath('/admin/training')
    return { ok: true as const, id: params.id }
  } else {
    const { data: inserted, error } = await supabase.from('training_modules').insert(payload).select('id').single()
    if (error) return { ok: false as const, error: error.message, id: undefined }
    revalidatePath('/admin/training')
    return { ok: true as const, id: inserted?.id }
  }
}

export async function saveQuizQuestion(params: {
  id?: string
  module_id: string
  question: string
  options: { id: string; text: string }[]
  correct_option_id: string
  explanation: string | null
  order_index: number
}) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  const payload = {
    module_id: params.module_id,
    question: params.question,
    options: params.options,
    correct_option_id: params.correct_option_id,
    explanation: params.explanation || null,
    order_index: params.order_index,
  }
  if (params.id) {
    const { error } = await supabase.from('quiz_questions').update(payload).eq('id', params.id)
    if (error) return { ok: false as const, error: error.message }
  } else {
    const { error } = await supabase.from('quiz_questions').insert(payload)
    if (error) return { ok: false as const, error: error.message }
  }
  revalidatePath('/admin/training')
  return { ok: true as const }
}

export async function deleteQuizQuestion(id: string) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/training')
  return { ok: true as const }
}

export async function reorderQuizQuestions(moduleId: string, questionIds: string[]) {
  const check = await ensureAdmin()
  if (!check.ok) return { ok: false as const, error: check.error }
  const supabase = await createClient()
  for (let i = 0; i < questionIds.length; i++) {
    await supabase.from('quiz_questions').update({ order_index: i }).eq('id', questionIds[i]).eq('module_id', moduleId)
  }
  revalidatePath('/admin/training')
  return { ok: true as const }
}
