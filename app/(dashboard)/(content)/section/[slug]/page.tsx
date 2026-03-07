import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SectionPageClient } from '@/components/kb/SectionPageClient'

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: section } = await supabase
    .from('kb_sections')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!section) notFound()

  const { data: articlesRaw } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, order_index, updated_at, content')
    .eq('section_id', section.id)
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  const articles = (articlesRaw ?? []).map((a) => {
    const words = a.content ? JSON.stringify(a.content).split(/\s+/).length : 0
    const reading_minutes = Math.max(2, Math.ceil(words / 200))
    const { content: _, ...rest } = a
    return { ...rest, reading_minutes }
  })

  let recentReads: { article_id: string; article_title: string; article_slug: string; section_slug: string; read_at: string }[] = []
  let canEdit = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = (profile?.role as string)?.toLowerCase()
    canEdit = role === 'admin'
    const { data: reads } = await supabase
      .from('kb_reads')
      .select(`
        article_id,
        read_at,
        kb_articles ( title, slug, kb_sections ( slug ) )
      `)
      .eq('user_id', user.id)
      .not('article_id', 'is', null)
      .order('read_at', { ascending: false })
      .limit(20)
    if (reads && reads.length > 0) {
      recentReads = reads
        .map((r: { article_id: string; read_at: string; kb_articles?: { title: string; slug: string; kb_sections?: { slug: string } | null } | null }) => {
          const a = r.kb_articles
          if (!a) return null
          const sec = a.kb_sections
          return {
            article_id: r.article_id,
            article_title: a.title,
            article_slug: a.slug,
            section_slug: sec && typeof sec === 'object' && 'slug' in sec ? (sec as { slug: string }).slug : '',
            read_at: r.read_at,
          }
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
    }
  }

  return (
    <SectionPageClient
      sectionSlug={section.slug}
      sectionTitle={section.title}
      sectionDescription={section.description}
      sectionIcon={section.icon ?? 'fa-folder'}
      articles={articles}
      recentReads={recentReads}
      canEdit={canEdit}
    />
   )
}