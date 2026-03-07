'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Update KB article content only (inline edit).
 * Requires admin. Saves current content to kb_article_versions before updating.
 */
export async function updateArticle(articleId: string, content: object) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { ok: false as const, error: 'Admin only' }

  const { data: existing } = await supabase
    .from('kb_articles')
    .select('content, version, section_id, slug')
    .eq('id', articleId)
    .single()

  if (!existing) return { ok: false as const, error: 'Article not found' }

  if (existing.content) {
    await supabase.from('kb_article_versions').insert({
      article_id: articleId,
      content: existing.content,
      version: existing.version ?? 1,
      saved_by: user.id,
    })
  }

  const { error } = await supabase
    .from('kb_articles')
    .update({
      content: content ?? null,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
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

async function getSectionSlug(sectionId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('kb_sections').select('slug').eq('id', sectionId).single()
  return data?.slug ?? null
}
