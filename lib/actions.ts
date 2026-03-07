'use server'

import { createClient } from '@/lib/supabase/server'

export async function trackArticleRead(articleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('kb_reads').insert({ article_id: articleId, user_id: user.id })
}
