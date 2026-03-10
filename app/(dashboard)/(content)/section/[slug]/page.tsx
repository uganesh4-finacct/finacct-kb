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

  const articles = (articlesRaw ?? [])
    .filter((a) => {
      const c = a.content
      if (c == null || typeof c !== 'object') return false
      if ((c as { type?: string }).type !== 'doc') return false
      const content = (c as { content?: unknown[] }).content
      if (!Array.isArray(content) || content.length === 0) return false
      const words = JSON.stringify(c).split(/\s+/).length
      const minWords =
        section.slug === 'chart-of-accounts'
          ? 50
          : section.slug === 'exception-handling' || section.slug === 'standard-operating-procedures' || section.slug === 'sample-financials' || section.slug === 'pos-guides'
            ? 50
            : 100
      return words >= minWords
    })
    .map((a) => {
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
    /** Section-level actions (e.g. create first article from section) are admin-only. */
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
        .map((r: { article_id: string; read_at: string; kb_articles?: unknown }) => {
          const raw = r.kb_articles
          const a = Array.isArray(raw) ? raw[0] : raw
          if (!a || typeof a !== 'object' || !('title' in a) || !('slug' in a)) return null
          const secRaw = 'kb_sections' in a ? a.kb_sections : undefined
          const sec = Array.isArray(secRaw) ? secRaw[0] : secRaw
          const sectionSlug = sec && typeof sec === 'object' && sec !== null && 'slug' in sec ? String((sec as { slug: string }).slug) : ''
          return {
            article_id: r.article_id,
            article_title: String(a.title),
            article_slug: String(a.slug),
            section_slug: sectionSlug,
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