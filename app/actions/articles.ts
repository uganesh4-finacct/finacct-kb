'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const EDITABLE_ROLES = ['admin', 'editor'] as const

async function getAuthAndRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, userId: null, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = (profile?.role as string)?.toLowerCase()
  if (!role || !EDITABLE_ROLES.includes(role as typeof EDITABLE_ROLES[number])) {
    return { ok: false as const, userId: user.id, error: 'Admin or Editor only' }
  }
  return { ok: true as const, userId: user.id, error: null }
}

async function getSectionSlug(sectionId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('kb_sections').select('slug').eq('id', sectionId).single()
  return data?.slug ?? null
}

/**
 * Update KB article content (inline edit). Saves current content to kb_article_versions, then updates kb_articles.
 * Allowed for admin or editor role. User is resolved server-side.
 */
export async function updateArticle(articleId: string, content: object) {
  const check = await getAuthAndRole()
  if (!check.ok) return { ok: false as const, error: check.error }
  const userId = check.userId!

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('kb_articles')
    .select('content, version, section_id, slug')
    .eq('id', articleId)
    .single()

  if (!existing) return { ok: false as const, error: 'Article not found' }

  await saveArticleVersion(articleId, existing.content ?? { type: 'doc', content: [] }, existing.version ?? 1, userId)

  const { error } = await supabase
    .from('kb_articles')
    .update({
      content: content ?? null,
      updated_at: new Date().toISOString(),
      updated_by: userId,
      version: (existing.version ?? 1) + 1,
    })
    .eq('id', articleId)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/admin/articles')
  revalidatePath(`/admin/articles/${articleId}`)
  const sectionSlug = await getSectionSlug(existing.section_id)
  if (sectionSlug) {
    revalidatePath(`/section/${sectionSlug}`)
    revalidatePath(`/section/${sectionSlug}/${existing.slug}`)
  }
  return { ok: true as const }
}

/**
 * Save a snapshot of article content to version history.
 */
export async function saveArticleVersion(
  articleId: string,
  content: object,
  version: number,
  userId: string
) {
  const check = await getAuthAndRole()
  if (!check.ok) return { ok: false as const, error: check.error }

  const supabase = await createClient()
  const { error } = await supabase.from('kb_article_versions').insert({
    article_id: articleId,
    content,
    version,
    saved_by: userId,
  })

  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

/**
 * Get version history for an article (for future version history UI).
 */
export async function getArticleVersions(articleId: string) {
  const check = await getAuthAndRole()
  if (!check.ok) return { data: null, error: check.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kb_article_versions')
    .select('id, content, version, saved_by, saved_at')
    .eq('article_id', articleId)
    .order('saved_at', { ascending: false })
    .limit(50)

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
